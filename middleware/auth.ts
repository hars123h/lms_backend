import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/user.controller";
import { expressjwt, ExpressJwtRequest } from "express-jwt";
import { Secret } from "jsonwebtoken";
import userModel from "../models/user.model";
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';


interface RequestWithAuth extends Request<ParamsDictionary, any, any, ParsedQs> {
  auth?: any; // Replace 'any' with the actual type of 'auth'
}

let secret = process.env.REFRESH_TOKEN;
if (!secret) {
  throw new Error("REFRESH_TOKEN  is not defined");
}
export const SECRET_KEY: Secret = secret as Secret;
export interface CustomRequest extends Request {
  token: string | JwtPayload;
}
export const requireSignin = expressjwt({
  secret,
  algorithms: ["HS256"],
});
// authenticated user
export const isAutheticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;
    const user = decoded;
    if (!user) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }
    if (typeof decoded === "string") {
      req.user = JSON.parse(decoded);
    }
    console.log("Token", user);

    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
// authenticated user
// export const isAutheticated = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const access_token = req.cookies.access_token as string;

//     // console.log("AccessToken",access_token);

//     if (!access_token) {
//       return next(
//         new ErrorHandler("Please login to access this resource", 400)
//       );
//     }

//     const decoded = jwt.decode(access_token) as JwtPayload;

//     if (!decoded) {
//       return next(new ErrorHandler("access token is not valid", 400));
//     }

//     //check if the access token is expired
//     if (decoded.exp && decoded.exp <= Date.now() / 1000) {
//       try {
//         console.log("Checking access  token is expired  ornot in middleware");
//         updateAccessToken(req, res, next);
//         console.log(
//           "Checking access  token is expired  ornot222 in middleware"
//         );
//       } catch (error) {
//         return next(error);
//       }
//     } else {
//       const user = await redis.get(decoded.id);

//       if (!user) {
//         return next(
//           new ErrorHandler("Please login to access this resource", 400)
//         );
//       }

//       req.user = JSON.parse(user);

//       next();
//     }
//   }
// );

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

export const adminMiddleware = async (
  req: RequestWithAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const User = await userModel.findById({ _id: req.auth._id });
    if (!User) {
      return next(new ErrorHandler("User Not Found", 400));
    }
    if (User.role !== "admin") {
      return next(new ErrorHandler("Oops This is an Admin Resource", 403));
    }
    
    // req.profile = User;
    next();
  } catch (err) {
    res.status(403).send("Admin Resourse Access Denied !");
  }
};
