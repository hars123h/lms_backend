import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IRecharge extends Document {
  user_id: IUser;
  refno: number;
  recharge_value: number;
  status: string;
  mobno: string;
  parent_id:IUser;
  grand_parent_id:IUser;
  great_grand_parent_id:IUser;

}

const rechargeSchema = new Schema<IRecharge>(
  {
    user_id: Object,
    parent_id: Object,
    grand_parent_id: Object,
    great_grand_parent_id: Object,
    refno: Number,
    recharge_value: Number,
    status: { 
      type: String,
      default: "Pending",
    },
  },
  {timestamps: true}
);

const RechargeModel: Model<IRecharge> = mongoose.model(
  "recharge",
  rechargeSchema
);

export default RechargeModel;
