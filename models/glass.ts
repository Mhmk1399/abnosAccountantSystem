import mongoose from "mongoose";

const glassSchema = new mongoose.Schema(
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
   
    thickness: {
      type: Number,
      required: true,
    },
    sellPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.models.Glass || mongoose.model("Glass", glassSchema);
