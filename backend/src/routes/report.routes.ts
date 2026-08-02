import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { getSummary } from "../controllers/report.controller";

const router = Router();

router.use(authenticate);

router.get("/", getSummary);

export default router;