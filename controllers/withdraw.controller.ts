import WithdrawModel from "../models/withdraw.model";
import userModel from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';


interface RequestWithAuth extends Request<ParamsDictionary, any, any, ParsedQs> {
  auth?: any; // Replace 'any' with the actual type of 'auth'
}
// Place Withdraw by the user
export const placeWithdraw = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const validUser = await userModel.findOne({ _id: req.auth?._id });

      if (validUser?.tradePassword !== data.tradePassword) {
        return next(new ErrorHandler("Incorrect Trade Password", 400));
      }

      const withdraw = await WithdrawModel.create(data);

      if (validUser) {
        await userModel.findByIdAndUpdate(
          { _id: req.auth?._id },
          {
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
          },
          { new: true }
        );
        const validUser2 = await userModel.findOne({ _id: req.auth?._id });

        await redis.set(req.auth?._id, JSON.stringify(validUser2));

        res.status(201).json({
          success: true,
          withdraw: withdraw,
          user:validUser2
        });
      } else {
        res.status(400).json({
          success: false,
          message: "No user found",
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Update Withdraw status
export const updateWithdraw = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const updatedWithdraw = await WithdrawModel.updateOne(
        { _id: data.withdrawal_id },
        {
          $set: {
            status: data.new_status,
          },
        }
      );
      const withdrawData = await WithdrawModel.findOne({
        _id: req.body.withdrawal_id,
      });
      if (data.new_status === "Declined") {
     const updateWith = await userModel.updateOne(
          { _id: withdrawData?.user },
          {
            $inc: {
              balance: Number(data.withdrawal_value),
              withdrawal_sum: -1 * Number(data.withdrawal_value),
            },
          }
        );
      }
      const validUser2 = await userModel.findOne({ _id: req.user?._id });
      await redis.set(req.user?._id, JSON.stringify(validUser2));
      res.status(201).json({
        success: true,
        withdraw: updatedWithdraw,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all Withdrawal --- only admin
export const getWithdrawl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const withdrawl = await WithdrawModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        withdrawl,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Add Bank Detail
export const addBankDetails = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const bankData = {
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        cardHolderName: data.cardHolderName,
        ifsc: data.ifsc,
        mobileNumber: data.mobileNumber,
      };
      const validUser = await userModel.findOne({ _id: req.auth?._id });
      if (validUser) {
        const addBank = await userModel.findOneAndUpdate(
          { _id: req?.auth?._id },
          {
            $set: {
              bankDetails: bankData,
            },
          }
        );
        const validUser2 = await userModel.findOne({ _id: req.auth?._id });

        await redis.set(req.user?._id, JSON.stringify(validUser2));

        res.status(201).json({
          success: true,
          bank: addBank,
          user:validUser2
        });
      } else {
        res.status(400).json({
          success: false,
          message: "No user found",
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Set Trade Password

export const setTradePassword = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (data.tradePassword === data.confirmPassword) {
        const setTradePassword = await userModel.findOneAndUpdate(
          { _id: req?.auth?._id },
          {
            $set: {
              tradePassword: data.tradePassword,
            },
          }
        );
        const validUser2 = await userModel.findOne({ _id: req.auth?._id });
        await redis.set(req.auth?._id, JSON.stringify(validUser2));
        
        res.status(201).json({
          success: true,
          bank: setTradePassword,
          user:validUser2
        });
      } else {
        return next(new ErrorHandler("Password Not Matched", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


  // get all Withdrawal --- only for Users
  export const getUserWithdrawal = CatchAsyncError(
    async (req: RequestWithAuth, res: Response, next: NextFunction) => {
      try {
        const withdrawal = await WithdrawModel.find({user:req.auth?._id}).sort({
          createdAt: -1,
        });
  
        res.status(201).json({
          success: true,
          withdrawal,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
  
