import mongoose from "mongoose";

const InboxSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "DetailedAccount",
      required: true,
      unique: true, // One inbox per account
    },
    balance: {
      type: Number,
      default: 0,
    },
    
    incomeTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Transaction", // Only transactions with type: 'received'
      },
    ],
    outcomeTransactions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Transaction", // Only transactions with type: 'paied'
      },
    ],
    checkStatuses: {
      type: Map,
      of: {
        type: [mongoose.Types.ObjectId],
        ref: "CheckTransaction",
      },
      default: {
        nazeSandogh: [],
        darJaryanVosool: [],
        vosoolShode: [],
        bargashti: [],
        enteghalDadeShode: [],
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Inbox || mongoose.model("Inbox", InboxSchema);
