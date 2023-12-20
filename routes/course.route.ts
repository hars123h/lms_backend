import express from "express";
import {
  addAnwser,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  //   generateVideoUrl,
  getAdminAllCourses,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import {
  adminMiddleware,
  authorizeRoles,
  isAutheticated,
  requireSignin,
} from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  requireSignin,
  adminMiddleware,
  uploadCourse
);

courseRouter.put(
  "/edit-course/:id",
  requireSignin,
  adminMiddleware,
  editCourse
);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/get-courses", getAllCourses);

courseRouter.get(
  "/get-admin-courses",
  requireSignin,
  adminMiddleware,
  getAdminAllCourses
);

courseRouter.get("/get-course-content/:id", isAutheticated, getCourseByUser);

courseRouter.put("/add-question", isAutheticated, addQuestion);

courseRouter.put("/add-answer", isAutheticated, addAnwser);

courseRouter.put("/add-review/:id", isAutheticated, addReview);

courseRouter.put(
  "/add-reply",
  isAutheticated,
  authorizeRoles("admin"),
  addReplyToReview
);

// courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

courseRouter.delete(
  "/delete-course/:id",
  requireSignin,
  adminMiddleware,
  deleteCourse
);

export default courseRouter;
