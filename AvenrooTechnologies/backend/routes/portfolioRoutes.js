import express from "express";
import { getPublicPortfolio } from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/", getPublicPortfolio);

export default router;
