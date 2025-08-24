import mongoose from "mongoose";

const prioritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Number,
      required: true,
    },
    glasss: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Glass",
      required: false,
    },
    ServiceFee: {
      serviceFeeType: {
        type: String,
        enum: ["percentage", "number"],
        required: true,
        default: "percentage",
      },
      serviceFeeValue: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);
export default mongoose.models.Priority ||
  mongoose.model("Priority", prioritySchema);
