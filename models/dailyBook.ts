import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    accountGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountGroup",
      required: true,
    },
    totalAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TotalAccount",
      required: true,
    },
    fixedAccounts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixedAccount",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    detailed1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DetailedAccount",
    },
    detailed2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DetailedAccount",
    },
    fiscalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
      required: true,
    },
  },
  { _id: false }
);

const dailyBookSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    debitEntries: {
      type: [entrySchema],
      default: [],
    },
    creditEntries: {
      type: [entrySchema],
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["draft", "posted", "reversed", "canceled"],
      default: "draft",
    },
    attachments: [
      {
        name: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Check if the model exists before creating it to prevent the "Cannot overwrite model" error
export default mongoose.models.DailyBook ||
  mongoose.model("DailyBook", dailyBookSchema);
