import mongoose from "mongoose";

const AccountGroupSchema = new mongoose.Schema(
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
      unique: true, // Ensure unique account codes
      match: /^[0-9A-Za-z-]+$/, // Example: Alphanumeric code validation
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
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
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default mongoose.models.AccountGroup ||
  mongoose.model("AccountGroup", AccountGroupSchema);
