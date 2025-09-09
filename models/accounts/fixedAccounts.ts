import mongoose from "mongoose";

const FixedAccountSchema = new mongoose.Schema(
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
    totalAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TotalAccount",
      required: true,
    },
    howManyDetailedDoesItHave: {
      type: Number,
      required: true,
      default: 0,
    },
    detailedAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailedAccount",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    type: {
      type: String,
      required: true,
      enum: ["debit", "credit"],
      default: "debit",
    },
    fiscalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
    },
    fiscalType: {
      type: String,
      enum: ["permanat", "temparary"],
      default: "permanat",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FixedAccount ||
  mongoose.model("FixedAccount", FixedAccountSchema);
