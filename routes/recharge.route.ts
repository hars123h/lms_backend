import express from "express";
import { adminMiddleware, authorizeRoles, isAutheticated, requireSignin } from "../middleware/auth";

import { getRecharge, placeRecharge, updateRecharge,getUserRecharge, getUserRechargeAdmin } from "../controllers/recharge.controller";

const rechargeRoute = express.Router();


rechargeRoute.post("/place-recharge", requireSignin, placeRecharge);
rechargeRoute.post("/update-recharge-status", requireSignin, adminMiddleware, updateRecharge);
rechargeRoute.get("/get-recharge-all",requireSignin, adminMiddleware, getRecharge);
// rechargeRoute.get("/get-recharge-all",isAutheticated, getRecharge);
rechargeRoute.get("/get-recharge-user",requireSignin, getUserRecharge);
rechargeRoute.post("/get-recharge-admin",requireSignin, getUserRechargeAdmin);






export default rechargeRoute;
 