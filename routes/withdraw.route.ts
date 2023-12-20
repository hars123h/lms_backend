import express from "express";
import { adminMiddleware, authorizeRoles, isAutheticated, requireSignin } from "../middleware/auth";

import {
  getWithdrawl,
  placeWithdraw,
  updateWithdraw,
  setTradePassword,
  addBankDetails,
  getUserWithdrawal,
} from "../controllers/withdraw.controller";
const withdrawRoute = express.Router();

withdrawRoute.post("/place-withdraw", requireSignin, placeWithdraw);
withdrawRoute.get("/get-withdraw", requireSignin, getWithdrawl);
withdrawRoute.post("/update-withdrawal-status", requireSignin, adminMiddleware, updateWithdraw);
withdrawRoute.post("/add-bank", requireSignin, addBankDetails);
withdrawRoute.post("/trade-password", requireSignin, setTradePassword);
withdrawRoute.get("/get-user-withdrawal", requireSignin, getUserWithdrawal);

export default withdrawRoute;
