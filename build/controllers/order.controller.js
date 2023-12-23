"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStripePublishableKey = exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_Model_1 = __importDefault(require("../models/notification.Model"));
const order_service_1 = require("../services/order.service");
const redis_1 = require("../utils/redis");
require("dotenv").config();
// create order
exports.createOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId, payment_info, purchasedPrice } = req.body;
        // if (payment_info) {
        //   if ("id" in payment_info) {
        //     const paymentIntentId = payment_info.id;
        //     const paymentIntent = await stripe.paymentIntents.retrieve(
        //       paymentIntentId
        //     );
        //     if (paymentIntent.status !== "succeeded") {
        //       return next(new ErrorHandler("Payment not authorized!", 400));
        //     }
        //   }
        // }
        const user = await user_model_1.default.findById(req.auth?._id);
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler_1.default("You have already purchased this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        user?.courses.push(course?._id);
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        await notification_Model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });
        course.purchased = course.purchased + 1;
        await course.save();
        // Level 1  commission
        const level1 = await user_model_1.default.updateOne({ user_invite: user?.parent_invt }, {
            $inc: {
                earning: Number((10 / 100) * Number(purchasedPrice)),
                level1Recharge: Number((10 / 100) * Number(purchasedPrice)),
            },
        });
        // Level 2  commission
        const level2 = await user_model_1.default.updateOne({ user_invite: user?.grand_parent_invt }, {
            $inc: {
                earning: Number((3 / 100) * Number(purchasedPrice)),
                level2Recharge: Number((3 / 100) * Number(purchasedPrice)),
            },
        });
        // Level 3  commission
        const level3 = await user_model_1.default.updateOne({ user_invite: user?.great_grand_parent_invt }, {
            $inc: {
                earning: Number((1 / 100) * Number(purchasedPrice)),
                level3Recharge: Number((1 / 100) * Number(purchasedPrice)),
            },
        });
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get All orders --- only for admin
exports.getAllOrders = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//  send stripe publishble key
exports.sendStripePublishableKey = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res) => {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
// new payment
// export const newPayment = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const myPayment = await stripe.paymentIntents.create({
//         amount: req.body.amount,
//         currency: "USD",
//         metadata: {
//           company: "E-Learning",
//         },
//         automatic_payment_methods: {
//           enabled: true,
//         },
//       });
//       res.status(201).json({
//         success: true,
//         client_secret: myPayment.client_secret,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
