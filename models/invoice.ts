import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    sideMaterial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SideMaterial",
    },
    priority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Priority",
    },
    productionDate: {
      type: Date,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    layers: [
      {
        glass: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Glass",
        },
        treatments: [
          {
            treatment: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Treatment",
            },
            count: {
              type: Number,
            },
            measurement: {
              type: String,
            },
          },
        ],
        width: {
          type: Number,
          required: true,
        },
        height: {
          type: Number,
          required: true,
        },
      },
    ],
    type: {
      type: String,
    },
    count: {
      type: Number,
      required: true,
    },
    designNumber: {
      type: String,
      ref: "DesignNumber",
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    confirmBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    editBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "in progress",
        "completed",
        "cancelled",
        "stop production",
      ],
      default: "pending",
    },
    productuModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    },
    
  },
  
  { timestamps: true }
);
export default mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);
