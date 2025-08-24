import mongoose from "mongoose";

const glassTreatmentSchema = new mongoose.Schema(
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
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    }
  },
  { timestamps: true }
);
export default mongoose.models.GlassTreatment ||
  mongoose.model("GlassTreatment", glassTreatmentSchema);
