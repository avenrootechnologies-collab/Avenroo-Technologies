import mongoose from "mongoose";

const adminVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AdminVerification", adminVerificationSchema);
