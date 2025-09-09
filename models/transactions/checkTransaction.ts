import mongoose from "mongoose";

const CheckTransactionSchema = new mongoose.Schema(
  {
    checkNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    seryNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    // Main status of the check in lifecycle
    status: {
      type: String,
      enum: [
        "nazeSandogh", // نزد صندوق
        "darJaryanVosool", // در جریان وصول
        "vosoolShode", // وصول شده
        "bargashti", // برگشتی
        "enteghalDadeShode", // انتقال داده شده
      ],
      default: "nazeSandogh",
    },

    // Optional: Further status tracking for inbox side (like sub-status)
    inboxStatus: {
      type: String,
      enum: [
        "darJaryanVosool",
        "vosoolShode",
        "bargashti",
        "enteghalDadeShode",

        null,
      ],
      default: function (this: { status: string }) {
        return this.status === "nazeSandogh" ? "darJaryanVosool" : null;
      },
      validate: {
        validator: function (this: { status: string }, val: string | null) {
          if (this.status === "nazeSandogh") {
            return val !== null;
          }
          return val === null;
        },
        message:
          "inboxStatus must be set if status is 'nazeSandogh', and must be null otherwise",
      },
    },
    otherSideBank: [
      {
        name: { type: String },
        owner: { type: String },
        accountNumber: { type: String },
      },
    ],

    toBank: {
      type: mongoose.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
    },

    documentNumber: {
      type: String,
    },

    paidBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "DetailedAccount",
      },
    ],
    payTo: [
      {
        type: mongoose.Types.ObjectId,
        ref: "DetailedAccount",
      },
    ],

    receiverName: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "outcome"],
      default: "income",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CheckTransaction ||
  mongoose.model("CheckTransaction", CheckTransactionSchema);
