"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const withdraw_controller_1 = require("../controllers/withdraw.controller");
const withdrawRoute = express_1.default.Router();
withdrawRoute.post("/place-withdraw", auth_1.requireSignin, withdraw_controller_1.placeWithdraw);
withdrawRoute.get("/get-withdraw", auth_1.requireSignin, withdraw_controller_1.getWithdrawl);
withdrawRoute.post("/update-withdrawal-status", auth_1.requireSignin, auth_1.adminMiddleware, withdraw_controller_1.updateWithdraw);
withdrawRoute.post("/add-bank", auth_1.requireSignin, withdraw_controller_1.addBankDetails);
withdrawRoute.post("/trade-password", auth_1.requireSignin, withdraw_controller_1.setTradePassword);
withdrawRoute.get("/get-user-withdrawal", auth_1.requireSignin, withdraw_controller_1.getUserWithdrawal);
exports.default = withdrawRoute;
