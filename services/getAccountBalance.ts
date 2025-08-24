import mongoose from "mongoose";
import DailyBook from "@/models/dailyBook";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import FixedAccount from "@/models/accounts/fixedAccounts";
import TotalAccount from "@/models/accounts/totalAccount";
import AccountGroup from "@/models/accounts/accountGroup";

export const getDetailedAccountHierarchyBalance = async (
  detailedAccountId: string
) => {
  // 1️⃣ Validate input
  if (!mongoose.Types.ObjectId.isValid(detailedAccountId)) {
    throw new Error("Invalid DetailedAccount ID");
  }

  const detailedId = new mongoose.Types.ObjectId(detailedAccountId);

  // 2️⃣ Find the current detailed account
  const detailed = await DetailedAccount.findById(detailedId);
  if (!detailed) throw new Error("DetailedAccount not found");

  // 3️⃣ Find the FixedAccount that contains this detailed account
  const fixed = await FixedAccount.findOne({ detailedAccounts: detailedId });
  if (!fixed) throw new Error("FixedAccount not found");

  // 4️⃣ Find the TotalAccount and AccountGroup
  const total = await TotalAccount.findById(fixed.totalAccount);
  if (!total) throw new Error("TotalAccount not found");

  const group = await AccountGroup.findById(total.accountGroup);
  if (!group) throw new Error("AccountGroup not found");

  // 🧮 Helper function to aggregate debit/credit for a list of detailed accounts
  const getBalanceFromEntries = async (
    detailedAccountIds: mongoose.Types.ObjectId[]
  ) => {
    console.log('🔍 Calculating balance for detailed account IDs:', detailedAccountIds);
    
    // Get debit totals
    const debitResult = await DailyBook.aggregate([
      { $unwind: "$debitEntries" },
      {
        $match: {
          $or: [
            { "debitEntries.detailed1": { $in: detailedAccountIds } },
            { "debitEntries.detailed2": { $in: detailedAccountIds } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$debitEntries.amount" },
        },
      },
    ]);

    // Get credit totals
    const creditResult = await DailyBook.aggregate([
      { $unwind: "$creditEntries" },
      {
        $match: {
          $or: [
            { "creditEntries.detailed1": { $in: detailedAccountIds } },
            { "creditEntries.detailed2": { $in: detailedAccountIds } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$creditEntries.amount" },
        },
      },
    ]);

    const totalDebit = debitResult.length > 0 ? debitResult[0].total : 0;
    const totalCredit = creditResult.length > 0 ? creditResult[0].total : 0;
    
    console.log('💰 Balance calculated - Debit:', totalDebit, 'Credit:', totalCredit, 'Net:', totalDebit - totalCredit);

    return {
      totalDebit,
      totalCredit,
      net: totalDebit - totalCredit,
    };
  };

  // 5️⃣ Get balance for this specific detailed account
  const detailedBalance = await getBalanceFromEntries([detailedId]);

  // 6️⃣ Get balance for all detailed accounts under the fixed account
  const fixedAccount = await FixedAccount.findById(fixed._id).select(
    "detailedAccounts"
  );
  const fixedBalance = await getBalanceFromEntries(
    fixedAccount!.detailedAccounts
  );

  // 7️⃣ Get all fixed accounts under the total account
  const totalFixedAccounts = await FixedAccount.find({
    totalAccount: total._id,
  }).select("detailedAccounts");

  // Flatten all detailed account IDs from those fixed accounts
  const totalDetailedIds = totalFixedAccounts
    .flatMap((fa) => fa.detailedAccounts)
    .map((id) => new mongoose.Types.ObjectId(id));

  const totalBalance = await getBalanceFromEntries(totalDetailedIds);

  // 8️⃣ Get all total accounts under the group
  const groupTotalAccounts = await TotalAccount.find({
    accountGroup: group._id,
  }).select("_id");

  // Get all fixed accounts under those totals
  const groupFixedAccounts = await FixedAccount.find({
    totalAccount: { $in: groupTotalAccounts.map((t) => t._id) },
  }).select("detailedAccounts");

  // Flatten again
  const groupDetailedIds = groupFixedAccounts
    .flatMap((fa) => fa.detailedAccounts)
    .map((id) => new mongoose.Types.ObjectId(id));

  const groupBalance = await getBalanceFromEntries(groupDetailedIds);

  // ✅ Return full structure
  return {
    detailedAccount: {
      id: detailed._id,
      name: detailed.name,
      ...detailedBalance,
    },
    fixedAccount: {
      id: fixed._id,
      name: fixed.name,
      ...fixedBalance,
    },
    totalAccount: {
      id: total._id,
      name: total.name,
      ...totalBalance,
    },
    accountGroup: {
      id: group._id,
      name: group.name,
      ...groupBalance,
    },
  };
};
