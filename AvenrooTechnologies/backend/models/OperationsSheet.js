import mongoose from "mongoose";

const operationsSheetSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "contacts" },
    columns: { type: [String], required: true },
    rows: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("OperationsSheet", operationsSheetSchema);
