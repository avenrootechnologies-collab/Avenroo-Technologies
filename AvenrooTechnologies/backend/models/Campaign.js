import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, maxlength: 12000 },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["sent", "partial", "failed"], default: "failed" },
  },
  { timestamps: true },
);

export default mongoose.model("Campaign", campaignSchema);
