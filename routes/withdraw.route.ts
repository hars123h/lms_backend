import express from "express";
import { adminMiddleware, authorizeRoles, isAutheticated, requireSignin } from "../middleware/auth";

import {
  getWithdrawl,
  placeWithdraw,
  updateWithdraw,
  setTradePassword,
  addBankDetails,
  getUserWithdrawal,
  getUserWithdrawalAdmin
} from "../controllers/withdraw.controller";
const withdrawRoute = express.Router();

withdrawRoute.post("/place-withdraw", requireSignin, placeWithdraw);
withdrawRoute.get("/get-withdraw", requireSignin, getWithdrawl);
withdrawRoute.post("/update-withdrawal-status", requireSignin, adminMiddleware, updateWithdraw);
withdrawRoute.post("/add-bank", requireSignin, addBankDetails);
withdrawRoute.post("/trade-password", requireSignin, setTradePassword);
withdrawRoute.get("/get-user-withdrawal", requireSignin, getUserWithdrawal);
withdrawRoute.post("/get-admin-withdrawal", requireSignin, getUserWithdrawalAdmin);


export default withdrawRoute;
