import mongoose from "mongoose";

const adminInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  tokenHash: { type: String, required: true, unique: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AdminInvite", adminInviteSchema);
