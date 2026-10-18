import mongoose from "mongoose";

const packageCoverageSchema = new mongoose.Schema(
  {
    launchSprint: {
      type: String,
      trim: true,
      default: "",
    },
    growthBuild: {
      type: String,
      trim: true,
      default: "",
    },
    ongoingPartner: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Service slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    startingPriceLabel: {
      type: String,
      trim: true,
      default: "",
    },
    recommendedPackage: {
      type: String,
      trim: true,
      default: "",
    },
    bestFor: {
      type: String,
      trim: true,
      default: "",
    },
    includedItems: {
      type: [String],
      default: [],
    },
    packageCoverage: {
      type: packageCoverageSchema,
      default: () => ({}),
    },
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    highlights: {
      type: [String],
      default: [],
    },
    outcome: {
      type: String,
      trim: true,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ isActive: 1, sortOrder: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
