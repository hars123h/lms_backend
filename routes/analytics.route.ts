import express from "express";
import {
  adminMiddleware,
  authorizeRoles,
  isAutheticated,
  requireSignin,
} from "../middleware/auth";
import {
  getCoursesAnalytics,
  getOrderAnalytics,
  getUsersAnalytics,
} from "../controllers/analytics.controller";
const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-users-analytics",
  requireSignin,
  adminMiddleware,
  getUsersAnalytics
);

analyticsRouter.get(
  "/get-orders-analytics",
  requireSignin,
  adminMiddleware,
  getOrderAnalytics
);

analyticsRouter.get(
  "/get-courses-analytics",
  requireSignin,
  adminMiddleware,
  getCoursesAnalytics
);

export default analyticsRouter;
