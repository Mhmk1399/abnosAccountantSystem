import mongoose from "mongoose";

const typeOfDailyBookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  savedDebitAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FixedAccount",
  },
  savedCreditAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FixedAccount",
  },
  debitSampleDescriptions: {
    type: [String],
    default: [],
  },
  creditSampleDescriptions: {
    type: [String],
    default: [],
  },
});

export default mongoose.models.typeOfDailyBook ||
  mongoose.model("typeOfDailyBook", typeOfDailyBookSchema);
