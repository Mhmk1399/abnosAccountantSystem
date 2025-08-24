import mongoose from "mongoose";

const DeficitSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["buy glass", "punishment", "help"],
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export default   mongoose.models.Deficit
 ||mongoose.model("Deficit", DeficitSchema);
