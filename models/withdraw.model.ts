import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IWithdraw extends Document {
  user: IUser;
  fullName: string;
  phoneNo: string;
  bankAccount: string;
  ifsc: string;
  bankName: string;
  withdrawalAmount: number;
  afterDeduction: number;
  status: string;
}

const withdrawSchema = new Schema<IWithdraw>(
  {
    user: Object,
    fullName: String,
    phoneNo: String,
    bankAccount: String,
    ifsc: String,
    bankName: String,
    withdrawalAmount: Number,
    afterDeduction: Number,
    status: {
      type: String,
      default: "Pending",
    },
  },
  {timestamps: true}
);

const WithdrawModel: Model<IWithdraw> = mongoose.model(
  "Withdraw",
  withdrawSchema
);

export default WithdrawModel;
