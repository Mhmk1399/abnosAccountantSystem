import mongoose from "mongoose";

const TransferTransactionSchema = new mongoose.Schema(
  {
    ourBank: {
      type: mongoose.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    transferReference: {
      type: Number,
      required: false,
      unique: true,
    },
    paidBy: {
      type: mongoose.Types.ObjectId,
      ref: "DetailedAccount",
      required: true,
    },
    payTo: {
      type: mongoose.Types.ObjectId,
      ref: "DetailedAccount",
      required: true,
    },
    transferDate: {
      type: Date,
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

export default mongoose.models.TransferTransaction ||
  mongoose.model("TransferTransaction", TransferTransactionSchema);
