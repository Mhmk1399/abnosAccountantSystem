import mongoose from "mongoose";

const GroupDetailAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    flag: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GroupDetailAccount ||
  mongoose.model("GroupDetailAccount", GroupDetailAccountSchema);
