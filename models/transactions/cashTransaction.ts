import mongoose from "mongoose";

const CashTransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
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
    documentNumber: {
      type: String,
    },
    documentDate: {
      type: Date,
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

export default mongoose.models.CashTransaction ||
  mongoose.model("CashTransaction", CashTransactionSchema);
