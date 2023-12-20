"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWithdrawal = exports.setTradePassword = exports.addBankDetails = exports.getWithdrawl = exports.updateWithdraw = exports.placeWithdraw = void 0;
const withdraw_model_1 = __importDefault(require("../models/withdraw.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const redis_1 = require("../utils/redis");
// Place Withdraw by the user
exports.placeWithdraw = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const validUser = await user_model_1.default.findOne({ _id: req.auth?._id });
        if (validUser?.tradePassword !== data.tradePassword) {
            return next(new ErrorHandler_1.default("Incorrect Trade Password", 400));
        }
        const withdraw = await withdraw_model_1.default.create(data);
        if (validUser) {
            await user_model_1.default.findByIdAndUpdate({ _id: req.auth?._id }, {
                $push: {
                    withdrawals: {
                        withdrawalId: withdraw?.id,
                        time: new Date(data.time),
                    },
                },
                $set: {
                    balance: validUser?.balance - data.withdrawalAmount,
                    lastWithdrawal: data.time,
                },
            }, { new: true });
            const validUser2 = await user_model_1.default.findOne({ _id: req.auth?._id });
            await redis_1.redis.set(req.auth?._id, JSON.stringify(validUser2));
            res.status(201).json({
                success: true,
                withdraw: withdraw,
                user: validUser2
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "No user found",
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//Update Withdraw status
exports.updateWithdraw = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const updatedWithdraw = await withdraw_model_1.default.updateOne({ _id: data.withdrawal_id }, {
            $set: {
                status: data.new_status,
            },
        });
        const withdrawData = await withdraw_model_1.default.findOne({
            _id: req.body.withdrawal_id,
        });
        if (data.new_status === "Declined") {
            const updateWith = await user_model_1.default.updateOne({ _id: withdrawData?.user }, {
                $inc: {
                    balance: Number(data.withdrawal_value),
                    withdrawal_sum: -1 * Number(data.withdrawal_value),
                },
            });
        }
        const validUser2 = await user_model_1.default.findOne({ _id: req.user?._id });
        await redis_1.redis.set(req.user?._id, JSON.stringify(validUser2));
        res.status(201).json({
            success: true,
            withdraw: updatedWithdraw,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all Withdrawal --- only admin
exports.getWithdrawl = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const withdrawl = await withdraw_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            withdrawl,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//Add Bank Detail
exports.addBankDetails = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const bankData = {
            bankName: data.bankName,
            bankAccount: data.bankAccount,
            cardHolderName: data.cardHolderName,
            ifsc: data.ifsc,
            mobileNumber: data.mobileNumber,
        };
        const validUser = await user_model_1.default.findOne({ _id: req.auth?._id });
        if (validUser) {
            const addBank = await user_model_1.default.findOneAndUpdate({ _id: req?.auth?._id }, {
                $set: {
                    bankDetails: bankData,
                },
            });
            const validUser2 = await user_model_1.default.findOne({ _id: req.auth?._id });
            await redis_1.redis.set(req.user?._id, JSON.stringify(validUser2));
            res.status(201).json({
                success: true,
                bank: addBank,
                user: validUser2
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "No user found",
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Set Trade Password
exports.setTradePassword = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        if (data.tradePassword === data.confirmPassword) {
            const setTradePassword = await user_model_1.default.findOneAndUpdate({ _id: req?.auth?._id }, {
                $set: {
                    tradePassword: data.tradePassword,
                },
            });
            const validUser2 = await user_model_1.default.findOne({ _id: req.auth?._id });
            await redis_1.redis.set(req.auth?._id, JSON.stringify(validUser2));
            res.status(201).json({
                success: true,
                bank: setTradePassword,
                user: validUser2
            });
        }
        else {
            return next(new ErrorHandler_1.default("Password Not Matched", 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all Withdrawal --- only for Users
exports.getUserWithdrawal = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const withdrawal = await withdraw_model_1.default.find({ user: req.auth?._id }).sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            withdrawal,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
