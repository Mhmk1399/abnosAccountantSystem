import mongoose from "mongoose";

const AccountBalanceSchema = new mongoose.Schema(
  {
    accountLevel: {
      type: String,
      enum: ["group", "total", "fixed", "detailed"],
      required: true,
    },
    accountRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "accountModel", // dynamic ref based on level
    },
    accountModel: {
      type: String,
      required: true,
      enum: ["AccountGroup", "TotalAccount", "FixedAccount", "DetailedAccount"],
    },
    fiscalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
      required: true,
    },
    totalDebit: {
      type: Number,
      default: 0,
    },
    totalCredit: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      default: 0, // positive for debit, negative for credit
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AccountBalance ||
  mongoose.model("AccountBalance", AccountBalanceSchema);
