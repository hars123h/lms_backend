// import WithdrawModel from "../models/withdraw.model";
import userModel from "../models/user.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import RechargeModel from "../models/recharge.model";
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';


interface RequestWithAuth extends Request<ParamsDictionary, any, any, ParsedQs> {
  auth?: any; // Replace 'any' with the actual type of 'auth'
}
// Place Recharge by the user
export const placeRecharge = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (!data?.refno) {
        return next(new ErrorHandler("Please Enter Ref Number", 400));
      }
      // if (data?.refno.length < 12) {
      //   return next(
      //     new ErrorHandler("Ref No. should be atleast 12 digit", 400)
      //   );
      // }

      if (!data?.recharge_value) {
        return next(new ErrorHandler("Please Enter Recharge Amount", 400));
      }

      if (!data?.user_id) {
        return next(new ErrorHandler("User Not Found Please Try Again", 400));
      }
      const related_recharge = await RechargeModel.find({
        refno: req.body.refno,
      });
     
      const message = "Ref number already exist";
      if (related_recharge.length > 0) {
        return next(new ErrorHandler(message, 400));
      }
      

      const recharge = await RechargeModel.create(data);
     

      const validUser = await userModel.findOne({ _id: req.auth?._id });

      const updatedUser = await userModel.updateOne(
        { _id: req.auth?._id },
        {
          $push: {
            placed_recharges: {
              rechargeId: recharge._id,
              time: new Date(data.time),
            },
          },
        }
      );
      const validUser2 = await userModel.findOne({ _id: req.auth?._id });
      await redis.set(req.user?._id, JSON.stringify(validUser2));
      res.status(201).json({
        success: true,
        recharge: recharge,
        user:validUser2
      });
      
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateRecharge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const updatedRecharge = await RechargeModel.updateOne(
        { _id: data.recharge_id },
        {
          $set: {
            status: data.new_status,
          },
        }
      );
      const rechargeData = await RechargeModel.findOne({
        _id: req.body.recharge_id,
      });
      console.log("Recharge id",rechargeData );
      
      if (data?.new_status === "Confirmed") {
        console.log("statsu Confirmed", data?.recharge_value);
        const updateRecharge = await userModel.findByIdAndUpdate(
          { _id: rechargeData?.user_id },
          {
            $inc: {
              recharge_amount: data.recharge_value,
               balance: data.recharge_value
            }, 
          },
          { new: true }
        );
      }
      const validUser2 = await userModel.findOne({ _id: rechargeData?.user_id });
      await redis.set(req.user?._id, JSON.stringify(validUser2));
      res.status(201).json({
        success: true,
        recharge: updatedRecharge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all Recharge --- only admin
export const getRecharge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recharge = await RechargeModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        recharge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


// get all Recharge --- only for Users
export const getUserRecharge = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    
    try {
      const recharge = await RechargeModel.find({
        user_id: req?.auth?._id,
      }).sort({
        createdAt: -1,
      });
      
      res.status(201).json({
        success: true,
        recharge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get User Recharge --- only for Admins
export const getUserRechargeAdmin = CatchAsyncError(
  async (req: RequestWithAuth, res: Response, next: NextFunction) => {
    const data = req.body;
    try {
      const recharge = await RechargeModel.find({
        user_id: data?.userId,
      }).sort({
        createdAt: -1,
      });
      
      res.status(201).json({
        success: true,
        recharge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);