import mongoose from "mongoose";

const loanesSchema = new mongoose.Schema({
  name: String,
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
  },
  amount: { type: Number },
  paidperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DetailedAcounts",
  },

  Iinstallments: [
    {
      amount: { type: Number },
      year: { type: Number },
      month: { type: Number },
      paid: { type: Boolean },
      paidDate: { type: Date },
    },
  ],
});

export default mongoose.models.Loanes ||
  mongoose.model("Loanes", loanesSchema);
