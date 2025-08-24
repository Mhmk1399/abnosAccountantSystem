import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    dailyBookType: {
      type: mongoose.Types.ObjectId,
      ref: "DailyBook",
      required: true,
    },
    sourceAccount: {
      type: mongoose.Types.ObjectId,
      ref: "DetailedAccount",
      required: true,
    },
    destinationAccount: {
      type: mongoose.Types.ObjectId,
      ref: "DetailedAccount",
      required: true,
    },
    payType: {
      type: String,
      required: true,
      enum: ["cash", "check", "transfer"],
    },

    payTypeModel: {
      type: String,
      required: true,
      enum: ["CashTransaction", "CheckTransaction", "TransferTransaction"],
    },
    payDetail: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "payTypeModel",
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "outcome"],
      default: "income",
      required: false,
    },
  },
  { timestamps: true }
);
export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
