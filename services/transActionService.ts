import mongoose from "mongoose";
import CheckTransaction from "@/models/transactions/checkTransaction";
import Transaction from "@/models/transactions/transactions";
import DailyBook from "@/models/dailyBook";

interface ProcessTransactionInput {
  payType: "check";
  payDetailData: any;
  transactionData: {
    sourceAccount: string;
    destinationAccount: string;
    amount: number;
    date: Date;
    description: string;
  };
  dailyBookData: {
    debitEntries: any[];
    creditEntries: any[];
    documentNumber: string;
    date: Date;
    description: string;
    type: string;
    createdBy?: string;
  };
}

export async function processTransaction(input: ProcessTransactionInput) {
  console.log("🚀 Starting transaction process:", { payType: input.payType, amount: input.transactionData.amount });
  
  try {
    // Step 1: Create Check Transaction
    console.log("📝 Step 1: Creating check transaction...");
    const checkTransaction = await CheckTransaction.create(input.payDetailData);
    console.log("✅ Check transaction created:", checkTransaction._id);

    // Step 2: Create Main Transaction
    console.log("💰 Step 2: Creating main transaction...");
    const transaction = await Transaction.create({
      sourceAccount: new mongoose.Types.ObjectId(input.transactionData.sourceAccount),
      destinationAccount: new mongoose.Types.ObjectId(input.transactionData.destinationAccount),
      payType: "check",
      payTypeModel: "CheckTransaction",
      payDetail: checkTransaction._id,
      amount: input.transactionData.amount,
      date: input.transactionData.date,
      description: input.transactionData.description,
    });
    console.log("✅ Main transaction created:", transaction._id);

    // Step 3: Create Daily Book Entry
    console.log("📚 Step 3: Creating daily book entry...");
    const dailyBook = await DailyBook.create({
      documentNumber: input.dailyBookData.documentNumber,
      date: input.dailyBookData.date,
      debitEntries: input.dailyBookData.debitEntries,
      creditEntries: input.dailyBookData.creditEntries,
      description: input.dailyBookData.description,
      type: input.dailyBookData.type,
      createdBy: input.dailyBookData.createdBy ? new mongoose.Types.ObjectId(input.dailyBookData.createdBy) : undefined,
    });
    console.log("✅ Daily book entry created:", dailyBook._id);

    // Step 4: Link Transaction to Daily Book
    console.log("🔗 Step 4: Linking transaction to daily book...");
    transaction.dailyBookType = dailyBook._id;
    await transaction.save();
    console.log("✅ Transaction linked to daily book");

    console.log("🎉 Transaction process completed successfully");
    return { checkTransaction, transaction, dailyBook };
  } catch (error) {
    console.error("❌ Transaction process failed:", error);
    throw error;
  }
}
