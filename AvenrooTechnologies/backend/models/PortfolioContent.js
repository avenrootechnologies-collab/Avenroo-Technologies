import mongoose from "mongoose";

const portfolioContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "public-portfolio" },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model("PortfolioContent", portfolioContentSchema);
