import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const utilsDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(utilsDirectory, "../data");

export const LOCAL_CONTACTS_FILE =
  process.env.LOCAL_CONTACTS_FILE || path.join(dataDirectory, "contacts.local.json");
export const LOCAL_SERVICES_FILE =
  process.env.LOCAL_SERVICES_FILE || path.join(dataDirectory, "services.local.json");

const cloneCollection = (items) => JSON.parse(JSON.stringify(items));

const ensureCollectionFile = async (filePath, initialItems = []) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    logger.info("local_store.collection_file.created", {
      filePath,
      initialItemCount: initialItems.length,
    });
    await fs.writeFile(filePath, `${JSON.stringify(initialItems, null, 2)}\n`, "utf8");
  }
};

export const readJsonCollection = async (filePath, initialItems = []) => {
  logger.debug("local_store.collection.read.starting", { filePath });
  await ensureCollectionFile(filePath, initialItems);
  const raw = await fs.readFile(filePath, "utf8");

  if (!raw.trim()) {
    const fallbackItems = cloneCollection(initialItems);
    logger.warn("local_store.collection.empty_rewritten", {
      filePath,
      fallbackItemCount: fallbackItems.length,
    });
    await fs.writeFile(filePath, `${JSON.stringify(fallbackItems, null, 2)}\n`, "utf8");
    return fallbackItems;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Collection file must contain an array.");
    }

    logger.debug("local_store.collection.read.completed", {
      filePath,
      itemCount: parsed.length,
    });
    return parsed;
  } catch (error) {
    const fallbackItems = cloneCollection(initialItems);
    logger.warn("local_store.collection.invalid_rewritten", {
      filePath,
      fallbackItemCount: fallbackItems.length,
      error,
    });
    await fs.writeFile(filePath, `${JSON.stringify(fallbackItems, null, 2)}\n`, "utf8");
    return fallbackItems;
  }
};

export const writeJsonCollection = async (filePath, items) => {
  logger.debug("local_store.collection.write.starting", {
    filePath,
    itemCount: items.length,
  });
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  logger.info("local_store.collection.write.completed", {
    filePath,
    itemCount: items.length,
  });
  return items;
};

export const createLocalId = () => randomUUID();
