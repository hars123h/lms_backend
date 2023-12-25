"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const user_route_1 = __importDefault(require("./routes/user.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const withdraw_route_1 = __importDefault(require("./routes/withdraw.route"));
const recharge_route_1 = __importDefault(require("./routes/recharge.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const layout_route_1 = __importDefault(require("./routes/layout.route"));
//bodyparser
exports.app.use(express_1.default.json({ limit: "50mb" }));
//cookie-parser
exports.app.use((0, cookie_parser_1.default)());
//cors
exports.app.use((0, cors_1.default)({
    origin: '*'
}));
// api requests limit
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 100, 
// 	standardHeaders: 'draft-7', 
// 	legacyHeaders: false, 
// })
// Routes
exports.app.use("/api/v1", user_route_1.default);
exports.app.use("/api/v1", course_route_1.default);
exports.app.use("/api/v1", order_route_1.default);
exports.app.use("/api/v1", notification_route_1.default);
exports.app.use("/api/v1", withdraw_route_1.default);
exports.app.use("/api/v1", recharge_route_1.default);
exports.app.use("/api/v1", analytics_route_1.default);
exports.app.use("/api/v1", layout_route_1.default);
//testing api
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Api is Working",
    });
});
//Unknown Route
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not Found`);
    err.statusCode = 404;
    next(err);
});
// app.use(limiter);
exports.app.use(error_1.ErrorMiddleware);
