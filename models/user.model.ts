require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  whatsappNo:string;
  teleId:string;
  dob:string;
  profession:string;
  password: string;
  user_invite: string;
  parent_invt: string;
  grand_parent_invt: string;
  great_grand_parent_invt: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  level1Recharge:number;
  level2Recharge:number;
  level3Recharge:number;
  firstLevelData: Array<{ userId: string }>;
  secondLevelData: Array<{ userId: string }>;
  thirdLevelData: Array<{ userId: string }>;
  withdrawals: Array<{}>;
  placed_recharges: Array<{}>
  balance: number;
  recharge_amount: number;
  earning: number;
  withdrawal_sum: number;
  lastWithdrawal: Date;
  tradePassword:string;
  bankDetails:{
    bankName:string;
    bankAccount:number;
    cardHolderName:string;
    ifsc:string;
    mobileNumber:string;
  }
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    whatsappNo:String,
    teleId:String,
    dob:String,
    profession:String,
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
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
    level1Recharge: {
      type: Number,
      default: 0,
    },
    level2Recharge: {
      type: Number,
      default: 0,
    },
    level3Recharge: {
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
    bankDetails:{
      bankName:String,
      bankAccount:Number,
      cardHolderName:String,
      ifsc:String,
      mobileNumber:String
    },
    tradePassword:String,
    firstLevelData: [{}],
    secondLevelData: [{}],
    thirdLevelData: [{}],
    withdrawals: [{}],
    placed_recharges: [{}],

  },
  { timestamps: true }
);

// Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
