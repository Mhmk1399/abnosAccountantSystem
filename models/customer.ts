import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: false,
    },
    enName: {
      type: String,
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerType",
      required: true,
    },
    detailedAcount:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"DetailedAccount",
    }
  },
  { timestamps: true }
);
export default mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);
