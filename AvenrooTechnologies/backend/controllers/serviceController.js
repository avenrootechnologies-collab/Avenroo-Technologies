import Service from "../models/Service.js";
import mongoose from "mongoose";
import defaultServices from "../data/defaultServices.js";
import { isDatabaseReady } from "../config/db.js";
import {
  LOCAL_SERVICES_FILE,
  createLocalId,
  readJsonCollection,
  writeJsonCollection,
} from "../utils/localStore.js";
import { logRequestStep } from "../utils/logger.js";

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");
const cleanArray = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => cleanString(item))
        .filter(Boolean)
    : [];
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSlug = (value) =>
  cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizePackageCoverage = (coverage) => ({
  launchSprint: cleanString(coverage?.launchSprint),
  growthBuild: cleanString(coverage?.growthBuild),
  ongoingPartner: cleanString(coverage?.ongoingPartner),
});
const nowIso = () => new Date().toISOString();

const normalizeLocalService = (service, index = 0) => {
  const now = nowIso();
  const parsedPrice = Number(service.price);
  const parsedSortOrder = Number(service.sortOrder);

  return {
    _id: service._id || createLocalId(),
    title: cleanString(service.title),
    slug: buildSlug(service.slug || service.title || `service-${index + 1}`),
    description: cleanString(service.description),
    price: Number.isNaN(parsedPrice) || parsedPrice < 0 ? 0 : parsedPrice,
    startingPriceLabel: cleanString(service.startingPriceLabel),
    recommendedPackage: cleanString(service.recommendedPackage),
    bestFor: cleanString(service.bestFor),
    includedItems: cleanArray(service.includedItems),
    packageCoverage: normalizePackageCoverage(service.packageCoverage),
    icon: cleanString(service.icon),
    category: cleanString(service.category),
    highlights: cleanArray(service.highlights),
    outcome: cleanString(service.outcome),
    sortOrder: Number.isNaN(parsedSortOrder) ? (index + 1) * 10 : parsedSortOrder,
    isActive: service.isActive !== false,
    createdAt: service.createdAt || now,
    updatedAt: service.updatedAt || now,
  };
};

const normalizeServicePayload = (payload = {}, { partial = false } = {}) => {
  const next = {};
  const errors = [];

  if (!partial || hasOwn(payload, "title")) {
    const title = cleanString(payload.title);

    if (!title) {
      errors.push("Service title is required.");
    } else {
      next.title = title;
      next.slug = buildSlug(payload.slug || title);
    }
  } else if (hasOwn(payload, "slug")) {
    const slug = buildSlug(payload.slug);

    if (!slug) {
      errors.push("Service slug is invalid.");
    } else {
      next.slug = slug;
    }
  }

  if (!partial || hasOwn(payload, "description")) {
    const description = cleanString(payload.description);

    if (!description) {
      errors.push("Service description is required.");
    } else {
      next.description = description;
    }
  }

  if (hasOwn(payload, "price")) {
    const parsedPrice = Number(payload.price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push("Price must be a valid non-negative number.");
    } else {
      next.price = parsedPrice;
    }
  }

  if (hasOwn(payload, "startingPriceLabel")) {
    next.startingPriceLabel = cleanString(payload.startingPriceLabel);
  }

  if (hasOwn(payload, "recommendedPackage")) {
    next.recommendedPackage = cleanString(payload.recommendedPackage);
  }

  if (hasOwn(payload, "bestFor")) {
    next.bestFor = cleanString(payload.bestFor);
  }

  if (hasOwn(payload, "includedItems")) {
    next.includedItems = cleanArray(payload.includedItems);
  }

  if (hasOwn(payload, "packageCoverage")) {
    next.packageCoverage = normalizePackageCoverage(payload.packageCoverage);
  }

  if (hasOwn(payload, "icon")) {
    next.icon = cleanString(payload.icon);
  }

  if (hasOwn(payload, "category")) {
    next.category = cleanString(payload.category);
  }

  if (hasOwn(payload, "highlights")) {
    next.highlights = cleanArray(payload.highlights);
  }

  if (hasOwn(payload, "outcome")) {
    next.outcome = cleanString(payload.outcome);
  }

  if (hasOwn(payload, "sortOrder")) {
    const parsedSortOrder = Number(payload.sortOrder);

    if (Number.isNaN(parsedSortOrder)) {
      errors.push("Sort order must be a valid number.");
    } else {
      next.sortOrder = parsedSortOrder;
    }
  }

  if (hasOwn(payload, "isActive")) {
    next.isActive = Boolean(payload.isActive);
  }

  return { next, errors };
};

const sortServices = (services) =>
  [...services].sort((left, right) => {
    const leftOrder = Number(left.sortOrder) || 0;
    const rightOrder = Number(right.sortOrder) || 0;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return cleanString(left.title).localeCompare(cleanString(right.title));
  });

const getLocalServices = async () => {
  const storedServices = await readJsonCollection(LOCAL_SERVICES_FILE, []);
  const sourceServices = storedServices.length ? storedServices : defaultServices;
  const normalizedServices = sortServices(sourceServices.map(normalizeLocalService));
  const needsRewrite =
    storedServices.length === 0 ||
    normalizedServices.some((service, index) => {
      const stored = storedServices[index];
      return !stored || stored._id !== service._id || stored.updatedAt !== service.updatedAt;
    });

  if (needsRewrite) {
    await writeJsonCollection(LOCAL_SERVICES_FILE, normalizedServices);
  }

  return normalizedServices;
};

const matchLocalService = (services, identifier, { includeInactive = false } = {}) => {
  const normalizedIdentifier = cleanString(identifier).toLowerCase();

  return services.find((service) => {
    if (!includeInactive && service.isActive === false) {
      return false;
    }

    return (
      service._id === identifier ||
      buildSlug(service.slug || service.title) === normalizedIdentifier ||
      service.title.toLowerCase() === normalizedIdentifier
    );
  });
};

export const getServices = async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";

  logRequestStep(req, "info", "service.list.received", { includeInactive });

  if (!isDatabaseReady()) {
    logRequestStep(req, "info", "service.list.storage.local_file.starting");
    const services = await getLocalServices();
    logRequestStep(req, "info", "service.list.storage.local_file.completed", {
      total: services.length,
    });
    return res.json(
      services.filter((service) => includeInactive || service.isActive !== false),
    );
  }

  try {
    logRequestStep(req, "info", "service.list.storage.mongodb.starting");
    const filter = includeInactive ? {} : { isActive: { $ne: false } };
    const services = await Service.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();

    if (!services.length) {
      logRequestStep(req, "warn", "service.list.mongodb_empty_using_defaults", {
        defaultCount: defaultServices.length,
      });
      return res.json(
        defaultServices.filter((service) => includeInactive || service.isActive !== false),
      );
    }

    logRequestStep(req, "info", "service.list.storage.mongodb.completed", {
      total: services.length,
    });
    res.json(services);
  } catch (error) {
    logRequestStep(req, "error", "service.list.mongodb_failed_using_local_file", { error });
    const services = await getLocalServices();
    res.json(services.filter((service) => includeInactive || service.isActive !== false));
  }
};

export const createService = async (req, res) => {
  logRequestStep(req, "info", "service.create.received");
  const { next, errors } = normalizeServicePayload(req.body);

  if (errors.length) {
    logRequestStep(req, "warn", "service.create.validation_failed", { errors });
    return res.status(400).json({ message: errors.join(" ") });
  }

  logRequestStep(req, "debug", "service.create.payload_validated", {
    title: next.title,
    slug: next.slug,
    includedItemCount: next.includedItems?.length || 0,
    highlightCount: next.highlights?.length || 0,
  });

  try {
    if (!isDatabaseReady()) {
      logRequestStep(req, "info", "service.create.storage.local_file.starting");
      const services = await getLocalServices();
      const localService = normalizeLocalService(
        {
          ...next,
          _id: createLocalId(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
        services.length,
      );

      await writeJsonCollection(LOCAL_SERVICES_FILE, sortServices([...services, localService]));
      logRequestStep(req, "info", "service.create.storage.local_file.completed", {
        serviceId: localService._id,
        slug: localService.slug,
      });
      return res.status(201).json({ ...localService, storage: "local-file" });
    }

    logRequestStep(req, "info", "service.create.storage.mongodb.starting");
    const service = await Service.create(next);
    logRequestStep(req, "info", "service.create.storage.mongodb.completed", {
      serviceId: service._id,
      slug: service.slug,
    });
    res.status(201).json({ ...service.toObject(), storage: "mongodb" });
  } catch (error) {
    logRequestStep(req, "error", "service.create.failed", { error });
    res.status(400).json({ message: error.message || "Unable to create service." });
  }
};

export const getServiceByIdentifier = async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const { identifier } = req.params;

  logRequestStep(req, "info", "service.detail.received", { identifier, includeInactive });

  if (!isDatabaseReady()) {
    logRequestStep(req, "info", "service.detail.storage.local_file.starting", { identifier });
    const services = await getLocalServices();
    const localService = matchLocalService(services, identifier, { includeInactive });

    if (!localService) {
      logRequestStep(req, "warn", "service.detail.not_found", {
        identifier,
        storage: "local-file",
      });
      return res.status(404).json({ message: "Service not found." });
    }

    logRequestStep(req, "info", "service.detail.storage.local_file.completed", {
      identifier,
      serviceId: localService._id,
    });
    return res.json(localService);
  }

  try {
    logRequestStep(req, "info", "service.detail.storage.mongodb.starting", { identifier });
    const filter = includeInactive ? {} : { isActive: { $ne: false } };
    const normalizedIdentifier = cleanString(identifier).toLowerCase();
    const titlePattern = new RegExp(`^${escapeRegex(normalizedIdentifier.replace(/-/g, " "))}$`, "i");
    let service = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      service = await Service.findOne({ ...filter, _id: identifier }).lean();
    }

    if (!service) {
      service = await Service.findOne({
        ...filter,
        $or: [{ slug: normalizedIdentifier }, { title: titlePattern }],
      }).lean();
    }

    if (!service) {
      const services = await getLocalServices();
      const localService = matchLocalService(services, identifier, { includeInactive });

      if (localService) {
        logRequestStep(req, "warn", "service.detail.mongodb_miss_using_local_file", {
          identifier,
          serviceId: localService._id,
        });
        return res.json(localService);
      }
    }

    if (!service) {
      logRequestStep(req, "warn", "service.detail.not_found", {
        identifier,
        storage: "mongodb",
      });
      return res.status(404).json({ message: "Service not found." });
    }

    logRequestStep(req, "info", "service.detail.storage.mongodb.completed", {
      identifier,
      serviceId: service._id,
    });
    return res.json(service);
  } catch (error) {
    logRequestStep(req, "error", "service.detail.failed", { identifier, error });
    return res.status(500).json({ message: "Unable to load the requested service right now." });
  }
};

export const updateService = async (req, res) => {
  logRequestStep(req, "info", "service.update.received", { serviceId: req.params.id });
  const { next, errors } = normalizeServicePayload(req.body, { partial: true });

  if (errors.length) {
    logRequestStep(req, "warn", "service.update.validation_failed", {
      serviceId: req.params.id,
      errors,
    });
    return res.status(400).json({ message: errors.join(" ") });
  }

  logRequestStep(req, "debug", "service.update.payload_validated", {
    serviceId: req.params.id,
    updatedFields: Object.keys(next),
  });

  try {
    if (!isDatabaseReady()) {
      logRequestStep(req, "info", "service.update.storage.local_file.starting", {
        serviceId: req.params.id,
      });
      const services = await getLocalServices();
      const serviceIndex = services.findIndex((service) => service._id === req.params.id);

      if (serviceIndex === -1) {
        logRequestStep(req, "warn", "service.update.not_found", {
          serviceId: req.params.id,
          storage: "local-file",
        });
        return res.status(404).json({ message: "Service not found." });
      }

      const updatedService = normalizeLocalService(
        {
          ...services[serviceIndex],
          ...next,
          updatedAt: nowIso(),
        },
        serviceIndex,
      );

      services[serviceIndex] = updatedService;
      await writeJsonCollection(LOCAL_SERVICES_FILE, sortServices(services));
      logRequestStep(req, "info", "service.update.storage.local_file.completed", {
        serviceId: req.params.id,
        slug: updatedService.slug,
      });
      return res.json({ ...updatedService, storage: "local-file" });
    }

    logRequestStep(req, "info", "service.update.storage.mongodb.starting", {
      serviceId: req.params.id,
    });
    const service = await Service.findByIdAndUpdate(req.params.id, next, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      logRequestStep(req, "warn", "service.update.not_found", {
        serviceId: req.params.id,
        storage: "mongodb",
      });
      return res.status(404).json({ message: "Service not found." });
    }

    logRequestStep(req, "info", "service.update.storage.mongodb.completed", {
      serviceId: req.params.id,
      slug: service.slug,
    });
    return res.json({ ...service.toObject(), storage: "mongodb" });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;

    logRequestStep(req, statusCode === 400 ? "warn" : "error", "service.update.failed", {
      serviceId: req.params.id,
      statusCode,
      error,
    });

    return res.status(statusCode).json({
      message:
        statusCode === 400
          ? "Service id is invalid."
          : error.message || "Unable to update the service right now.",
    });
  }
};

export const deleteService = async (req, res) => {
  logRequestStep(req, "info", "service.archive.received", { serviceId: req.params.id });

  try {
    if (!isDatabaseReady()) {
      logRequestStep(req, "info", "service.archive.storage.local_file.starting", {
        serviceId: req.params.id,
      });
      const services = await getLocalServices();
      const serviceIndex = services.findIndex((service) => service._id === req.params.id);

      if (serviceIndex === -1) {
        logRequestStep(req, "warn", "service.archive.not_found", {
          serviceId: req.params.id,
          storage: "local-file",
        });
        return res.status(404).json({ message: "Service not found." });
      }

      const archivedService = {
        ...services[serviceIndex],
        isActive: false,
        updatedAt: nowIso(),
      };

      services[serviceIndex] = archivedService;
      await writeJsonCollection(LOCAL_SERVICES_FILE, sortServices(services));

      logRequestStep(req, "info", "service.archive.storage.local_file.completed", {
        serviceId: req.params.id,
      });

      return res.json({
        message: "Service archived successfully.",
        service: archivedService,
        storage: "local-file",
      });
    }

    logRequestStep(req, "info", "service.archive.storage.mongodb.starting", {
      serviceId: req.params.id,
    });
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!service) {
      logRequestStep(req, "warn", "service.archive.not_found", {
        serviceId: req.params.id,
        storage: "mongodb",
      });
      return res.status(404).json({ message: "Service not found." });
    }

    logRequestStep(req, "info", "service.archive.storage.mongodb.completed", {
      serviceId: req.params.id,
    });

    return res.json({
      message: "Service archived successfully.",
      service,
      storage: "mongodb",
    });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;

    logRequestStep(req, statusCode === 400 ? "warn" : "error", "service.archive.failed", {
      serviceId: req.params.id,
      statusCode,
      error,
    });

    return res.status(statusCode).json({
      message:
        statusCode === 400
          ? "Service id is invalid."
          : "Unable to archive the service right now.",
    });
  }
};
