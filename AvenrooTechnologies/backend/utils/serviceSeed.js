import Service from "../models/Service.js";
import defaultServices from "../data/defaultServices.js";
import { isDatabaseReady } from "../config/db.js";
import { logger } from "./logger.js";

export const ensureDefaultServices = async () => {
  if (!isDatabaseReady()) {
    logger.warn("services.seed.skipped", { reason: "database-unavailable" });
    return { seeded: false, seededCount: 0, reason: "database-unavailable" };
  }

  logger.debug("services.seed.bulk_write.starting", { defaultServiceCount: defaultServices.length });

  const operations = defaultServices.map((service) => ({
    updateOne: {
      filter: { slug: service.slug },
      update: { $setOnInsert: service },
      upsert: true,
    },
  }));

  const result = await Service.bulkWrite(operations, { ordered: false });
  logger.info("services.seed.bulk_write.completed", {
    upsertedCount: result.upsertedCount,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  return {
    seeded: result.upsertedCount > 0,
    seededCount: result.upsertedCount,
    reason: result.upsertedCount > 0 ? "seeded" : "already-populated",
  };
};
