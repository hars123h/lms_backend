import express from "express";
import { adminMiddleware, authorizeRoles, isAutheticated, requireSignin } from "../middleware/auth";
import {
  createOrder,
  getAllOrders,
  //   newPayment,
  //   sendStripePublishableKey,
} from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAutheticated, createOrder);

orderRouter.get(
  "/get-orders",
  requireSignin,
  adminMiddleware,
  getAllOrders
);

// orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);

// orderRouter.post("/payment", isAutheticated, newPayment);

export default orderRouter;
