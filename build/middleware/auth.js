"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authorizeRoles = exports.isAutheticated = exports.requireSignin = exports.SECRET_KEY = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_jwt_1 = require("express-jwt");
const user_model_1 = __importDefault(require("../models/user.model"));
let secret = process.env.REFRESH_TOKEN;
if (!secret) {
    throw new Error("REFRESH_TOKEN  is not defined");
}
exports.SECRET_KEY = secret;
exports.requireSignin = (0, express_jwt_1.expressjwt)({
    secret,
    algorithms: ["HS256"],
});
// authenticated user
const isAutheticated = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, exports.SECRET_KEY);
        req.token = decoded;
        const user = decoded;
        if (!user) {
            return next(new ErrorHandler_1.default("Please login to access this resource", 400));
        }
        if (typeof decoded === "string") {
            req.user = JSON.parse(decoded);
        }
        console.log("Token", user);
        next();
    }
    catch (err) {
        res.status(401).send("Please authenticate");
    }
};
exports.isAutheticated = isAutheticated;
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
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const adminMiddleware = async (req, res, next) => {
    try {
        const User = await user_model_1.default.findById({ _id: req.auth._id });
        if (!User) {
            return next(new ErrorHandler_1.default("User Not Found", 400));
        }
        if (User.role !== "admin") {
            return next(new ErrorHandler_1.default("Oops This is an Admin Resource", 403));
        }
        // req.profile = User;
        next();
    }
    catch (err) {
        res.status(403).send("Admin Resourse Access Denied !");
    }
};
exports.adminMiddleware = adminMiddleware;
