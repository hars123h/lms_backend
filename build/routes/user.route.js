"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
let secret = process.env.REFRESH_TOKEN;
if (!secret) {
    throw new Error("REFRESH_TOKEN  is not defined");
}
const userRouter = express_1.default.Router();
userRouter.post("/registration", user_controller_1.registrationUser);
userRouter.post("/activate-user", user_controller_1.activateUser);
userRouter.get("/refresh", user_controller_1.updateAccessToken);
userRouter.post("/login", user_controller_1.loginUser);
userRouter.get("/logout", auth_2.requireSignin, user_controller_1.logoutUser);
userRouter.get("/me", auth_2.requireSignin, user_controller_1.getUserInfo);
userRouter.get("/testJwt", auth_2.requireSignin, user_controller_1.getTestAuth);
userRouter.post("/social-auth", user_controller_1.socialAuth);
userRouter.put("/update-user-info", auth_2.requireSignin, user_controller_1.updateUserInfo);
userRouter.put("/update-user-password", auth_2.requireSignin, user_controller_1.updatePassword);
userRouter.put("/update-user-avatar", auth_2.requireSignin, user_controller_1.updateProfilePicture);
userRouter.get("/get-users", auth_2.requireSignin, auth_1.adminMiddleware, user_controller_1.getAllUsers);
userRouter.put("/update-user", auth_2.requireSignin, auth_1.adminMiddleware, user_controller_1.updateUserRole);
userRouter.delete("/delete-user/:id", auth_2.requireSignin, auth_1.adminMiddleware, user_controller_1.deleteUser);
userRouter.post("/get-single-user", auth_2.requireSignin, auth_1.adminMiddleware, user_controller_1.getSingleUser);
exports.default = userRouter;
