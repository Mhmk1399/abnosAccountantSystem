import mongoose from "mongoose";

const DetailedAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9A-Za-z-]+$/, // Example: Alphanumeric code validation
    },
    balance: {
      totalDebit: { type: Number, default: 0 },
      totalCredit: { type: Number, default: 0 },
      net: { type: Number, default: 0 }, // optional
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    fiscalType: {
      type: String,
      enum: ["permanat", "temparary"],
    },
    type: {
      type: String,
      required: true,
      enum: ["debit", "credit"],
    },
    fiscalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DetailedAccount ||
  mongoose.model("DetailedAccount", DetailedAccountSchema);
