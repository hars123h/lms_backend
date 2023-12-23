"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRechargeAdmin = exports.getUserRecharge = exports.getRecharge = exports.updateRecharge = exports.placeRecharge = void 0;
// import WithdrawModel from "../models/withdraw.model";
const user_model_1 = __importDefault(require("../models/user.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const redis_1 = require("../utils/redis");
const recharge_model_1 = __importDefault(require("../models/recharge.model"));
// Place Recharge by the user
exports.placeRecharge = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        if (!data?.refno) {
            return next(new ErrorHandler_1.default("Please Enter Ref Number", 400));
        }
        // if (data?.refno.length < 12) {
        //   return next(
        //     new ErrorHandler("Ref No. should be atleast 12 digit", 400)
        //   );
        // }
        if (!data?.recharge_value) {
            return next(new ErrorHandler_1.default("Please Enter Recharge Amount", 400));
        }
        if (!data?.user_id) {
            return next(new ErrorHandler_1.default("User Not Found Please Try Again", 400));
        }
        const related_recharge = await recharge_model_1.default.find({
            refno: req.body.refno,
        });
        const message = "Ref number already exist";
        if (related_recharge.length > 0) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const recharge = await recharge_model_1.default.create(data);
        const validUser = await user_model_1.default.findOne({ _id: req.auth?._id });
        const updatedUser = await user_model_1.default.updateOne({ _id: req.auth?._id }, {
            $push: {
                placed_recharges: {
                    rechargeId: recharge._id,
                    time: new Date(data.time),
                },
            },
        });
        const validUser2 = await user_model_1.default.findOne({ _id: req.auth?._id });
        await redis_1.redis.set(req.user?._id, JSON.stringify(validUser2));
        res.status(201).json({
            success: true,
            recharge: recharge,
            user: validUser2
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.updateRecharge = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const updatedRecharge = await recharge_model_1.default.updateOne({ _id: data.recharge_id }, {
            $set: {
                status: data.new_status,
            },
        });
        const rechargeData = await recharge_model_1.default.findOne({
            _id: req.body.recharge_id,
        });
        console.log("Recharge id", rechargeData);
        if (data?.new_status === "Confirmed") {
            console.log("statsu Confirmed", data?.recharge_value);
            const updateRecharge = await user_model_1.default.findByIdAndUpdate({ _id: rechargeData?.user_id }, {
                $inc: {
                    recharge_amount: data.recharge_value,
                    balance: data.recharge_value
                },
            }, { new: true });
        }
        const validUser2 = await user_model_1.default.findOne({ _id: rechargeData?.user_id });
        await redis_1.redis.set(req.user?._id, JSON.stringify(validUser2));
        res.status(201).json({
            success: true,
            recharge: updatedRecharge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all Recharge --- only admin
exports.getRecharge = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const recharge = await recharge_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            recharge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all Recharge --- only for Users
exports.getUserRecharge = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const recharge = await recharge_model_1.default.find({
            user_id: req?.auth?._id,
        }).sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            recharge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get User Recharge --- only for Admins
exports.getUserRechargeAdmin = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const data = req.body;
    try {
        const recharge = await recharge_model_1.default.find({
            user_id: data?.userId,
        }).sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            recharge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
