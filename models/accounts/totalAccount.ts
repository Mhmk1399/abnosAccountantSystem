import mongoose from "mongoose";

const TotalAccountSchema = new mongoose.Schema(
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
    accountGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountGroup",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    fiscalType: {
      type: String,
      enum: ["permanat", "temparary"],
      default: "permanat",
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TotalAccount ||
  mongoose.model("TotalAccount", TotalAccountSchema);
