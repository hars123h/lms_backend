"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const recharge_controller_1 = require("../controllers/recharge.controller");
const rechargeRoute = express_1.default.Router();
rechargeRoute.post("/place-recharge", auth_1.requireSignin, recharge_controller_1.placeRecharge);
rechargeRoute.post("/update-recharge-status", auth_1.requireSignin, auth_1.adminMiddleware, recharge_controller_1.updateRecharge);
rechargeRoute.get("/get-recharge-all", auth_1.requireSignin, auth_1.adminMiddleware, recharge_controller_1.getRecharge);
// rechargeRoute.get("/get-recharge-all",isAutheticated, getRecharge);
rechargeRoute.get("/get-recharge-user", auth_1.requireSignin, recharge_controller_1.getUserRecharge);
rechargeRoute.post("/get-recharge-admin", auth_1.requireSignin, recharge_controller_1.getUserRechargeAdmin);
exports.default = rechargeRoute;
