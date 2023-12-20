"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "please enter a valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    user_invite: {
        type: String,
        minlength: 6,
    },
    parent_invt: {
        type: String,
    },
    grand_parent_invt: {
        type: String,
    },
    great_grand_parent_invt: {
        type: String,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    balance: {
        type: Number,
        default: 0,
    },
    recharge_amount: {
        type: Number,
        default: 0,
    },
    earning: {
        type: Number,
        default: 0,
    },
    withdrawal_sum: {
        type: Number,
        default: 0,
    },
    lastWithdrawal: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        },
    ],
    bankDetails: {
        bankName: String,
        bankAccount: Number,
        cardHolderName: String,
        ifsc: String,
        mobileNumber: String
    },
    tradePassword: String,
    firstLevelData: [{}],
    secondLevelData: [{}],
    thirdLevelData: [{}],
    withdrawals: [{}],
    placed_recharges: [{}],
}, { timestamps: true });
// Hash Password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// sign access token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
        expiresIn: "5m",
    });
};
// sign refresh token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
        expiresIn: "3d",
    });
};
// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
