import express from "express";
import {
  adminMiddleware,
  authorizeRoles,
  isAutheticated,
  requireSignin,
} from "../middleware/auth";
import {
  getNotifications,
  updateNotification,
} from "../controllers/notification.controller";
const notificationRoute = express.Router();

notificationRoute.get(
  "/get-all-notifications",
  requireSignin,
  adminMiddleware,
  getNotifications
);
notificationRoute.put(
  "/update-notification/:id",
  requireSignin,
  adminMiddleware,
  updateNotification
);

export default notificationRoute;
