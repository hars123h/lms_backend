import express from "express";
import {
  registrationUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  deleteUser,
  getAllUsers,
  socialAuth,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
  getTestAuth
} from "../controllers/user.controller";
import { adminMiddleware, authorizeRoles, isAutheticated } from "../middleware/auth";
import { requireSignin } from "../middleware/auth";
// import { authorizeRoles, isAutheticated } from "../middleware/auth";

import { expressjwt, ExpressJwtRequest } from "express-jwt";
import { Secret } from "jsonwebtoken";

let secret = process.env.REFRESH_TOKEN;
if (!secret) {
  throw new Error("REFRESH_TOKEN  is not defined");
}
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);

userRouter.post("/activate-user", activateUser);

userRouter.get("/refresh", updateAccessToken);

userRouter.post("/login", loginUser);

userRouter.get("/logout", requireSignin, logoutUser);

userRouter.get("/me", requireSignin, getUserInfo);
userRouter.get("/testJwt", requireSignin, getTestAuth);


userRouter.post("/social-auth", socialAuth);

userRouter.put("/update-user-info", requireSignin, updateUserInfo);

userRouter.put("/update-user-password", requireSignin, updatePassword);

userRouter.put("/update-user-avatar", requireSignin, updateProfilePicture);

userRouter.get(
  "/get-users",
  requireSignin,
  adminMiddleware,
  getAllUsers
);

userRouter.put(
  "/update-user",
  requireSignin,
  adminMiddleware,
  updateUserRole
);

userRouter.delete(
  "/delete-user/:id",
  requireSignin,
  adminMiddleware,
  deleteUser
);

export default userRouter;
