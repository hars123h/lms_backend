require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRoute from "./routes/notification.route";
import withdrawRoute from "./routes/withdraw.route";
import rechargeRoute from "./routes/recharge.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { rateLimit } from 'express-rate-limit'




//bodyparser
app.use(express.json({ limit: "50mb" }));

//cookie-parser
app.use(cookieParser());

//cors
app.use(
  cors({
    origin: ["https://lms-frontend-azure-eight.vercel.app","http://localhost:3000"],
    credentials: true,
  })
);

// api requests limit
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 100, 
// 	standardHeaders: 'draft-7', 
// 	legacyHeaders: false, 
// })



// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRoute);
app.use("/api/v1", withdrawRoute);
app.use("/api/v1", rechargeRoute);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);





//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is Working",
  });
});

//Unknown Route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not Found`) as any;
  err.statusCode = 404;
  next(err);
});

// app.use(limiter);
app.use(ErrorMiddleware);
