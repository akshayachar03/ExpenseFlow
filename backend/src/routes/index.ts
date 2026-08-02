import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import dashboardRoutes from "./dashboard.routes";
import expenseRoutes from "./expense.routes";
import healthRoutes from "./health.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/auth", authRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/categories", categoryRoutes);

router.use("/expenses", expenseRoutes);

router.use("/reports", reportRoutes);

export default router;