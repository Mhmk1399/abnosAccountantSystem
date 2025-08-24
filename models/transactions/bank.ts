import mongoose from "mongoose";

const BankSchema = new mongoose.Schema(
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
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    branchCode: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    detailedAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DetailedAccount",
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.models.Bank || mongoose.model("Bank", BankSchema);
