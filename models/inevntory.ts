import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
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
    buyPrice: {
      type: Number,
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
    glass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Glass",
    },
    sideMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SideMaterial",
    },
    enterDate: {
      type: Date,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Virtual field for available stock
inventorySchema.virtual('availableStock').get(function() {
  return this.count - this.usedCount;
});

// Ensure virtual fields are serialized
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
