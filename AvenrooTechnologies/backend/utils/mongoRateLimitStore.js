import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { isDatabaseReady } from "../config/db.js";
import { logger } from "./logger.js";

const COLLECTION_NAME = "api_rate_limit_windows";
const MAX_LOCAL_COUNTERS = 5000;
const OVERFLOW_COUNTER_KEY = "\u0000overflow";
let indexPromise;

const getCollection = () => mongoose.connection.db.collection(COLLECTION_NAME);

const ensureExpiryIndex = async () => {
  if (!indexPromise) {
    indexPromise = Promise.resolve()
      .then(() => getCollection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "api_rate_limit_expiry" }))
      .catch((error) => {
        indexPromise = undefined;
        throw error;
      });
  }
  return indexPromise;
};

export class MongoRateLimitStore {
  constructor(prefix, { failClosed = false } = {}) {
    this.prefix = prefix;
    this.failClosed = failClosed;
    this.windowMs = 15 * 60 * 1000;
    this.localKeys = false;
    this.localCounters = new Map();
    this.lastFallbackWarningAt = 0;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  storageKey(key) {
    const digest = createHash("sha256").update(String(key)).digest("hex");
    return `${this.prefix}:${digest}`;
  }

  incrementLocally(key) {
    const now = Date.now();
    if (!this.localCounters.has(key) && this.localCounters.size >= MAX_LOCAL_COUNTERS - 1) {
      for (const [counterKey, counter] of this.localCounters) {
        if (counter.resetTime <= now) this.localCounters.delete(counterKey);
      }
    }

    const counterKey = this.localCounters.has(key)
      ? key
      : this.localCounters.size >= MAX_LOCAL_COUNTERS - 1
        ? OVERFLOW_COUNTER_KEY
        : key;
    const current = this.localCounters.get(counterKey);
    const count = current && current.resetTime > now ? current.totalHits + 1 : 1;
    const resetTime = current && current.resetTime > now ? current.resetTime : now + this.windowMs;
    this.localCounters.set(counterKey, { totalHits: count, resetTime });

    return { totalHits: count, resetTime: new Date(resetTime) };
  }

  warnAndFallback(error) {
    if (Date.now() - this.lastFallbackWarningAt > 60_000) {
      this.lastFallbackWarningAt = Date.now();
      logger.warn("rate_limit.shared_store_unavailable_using_local_fallback", { store: this.prefix, errorName: error?.name || "Error" });
    }
  }

  async increment(key) {
    if (isDatabaseReady()) {
      try {
        const collection = getCollection();
        await ensureExpiryIndex();
        const now = new Date();
        const nextExpiry = new Date(now.getTime() + this.windowMs);
        const result = await collection.findOneAndUpdate(
          { _id: this.storageKey(key) },
          [
            {
              $set: {
                totalHits: {
                  $cond: [
                    { $gt: ["$expiresAt", now] },
                    { $add: [{ $ifNull: ["$totalHits", 0] }, 1] },
                    1,
                  ],
                },
                expiresAt: { $cond: [{ $gt: ["$expiresAt", now] }, "$expiresAt", nextExpiry] },
              },
            },
          ],
          { upsert: true, returnDocument: "after", includeResultMetadata: false },
        );
        const counter = result?.value || result;
        if (!counter || typeof counter.totalHits !== "number" || !(counter.expiresAt instanceof Date)) {
          throw new Error("Rate limit counter was not returned by the database.");
        }
        this.localCounters.delete(key);
        return { totalHits: counter.totalHits, resetTime: counter.expiresAt };
      } catch (error) {
        this.warnAndFallback(error);
        if (this.failClosed) throw error;
      }
    }

    return this.incrementLocally(key);
  }

  async decrement(key) {
    const storageKey = this.storageKey(key);
    if (isDatabaseReady()) {
      try {
        await getCollection().updateOne({ _id: storageKey, totalHits: { $gt: 0 } }, { $inc: { totalHits: -1 } });
        return;
      } catch (error) {
        this.warnAndFallback(error);
      }
    }

    const current = this.localCounters.get(key);
    if (current) current.totalHits = Math.max(0, current.totalHits - 1);
  }

  async resetKey(key) {
    this.localCounters.delete(key);
    if (!isDatabaseReady()) return;
    try {
      await getCollection().deleteOne({ _id: this.storageKey(key) });
    } catch (error) {
      this.warnAndFallback(error);
    }
  }
}
