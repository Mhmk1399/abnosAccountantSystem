import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
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
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  { timestamps: true }
);
export default mongoose.models.Design || mongoose.model("Design", designSchema);
