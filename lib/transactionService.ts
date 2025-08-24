import FixedAccount from "@/models/accounts/fixedAccounts";
import connect from "./data";
import { PopulatedFixedAccount, DailyBookResponse, SaleTransactionParams } from "@/types/finalTypes";

/**
 * Creates a complete, balanced journal entry for a sales transaction.
 * @param {SaleTransactionParams} params - The parameters for the sale.
 * @returns {Promise<any>} The created daily book entry.
 */
export async function createSaleTransaction(
  params: SaleTransactionParams
): Promise<DailyBookResponse> {
  await connect();

  const {
    customerId,
    amount,
    description,
    documentNumber,
    fiscalYear,
    currency,
    userId,
  } = params;

  // These would typically be configurable or based on a more robust lookup system.
  // For this example, we'll find them by name.
  const accountsReceivableFixed = await FixedAccount.findOne({
    name: "Accounts Receivable",
  }).populate({
    path: "totalAccount",
    populate: {
      path: "accountGroup",
    },
  });
  const salesRevenueFixed = await FixedAccount.findOne({
    name: "Sales Revenue",
  }).populate({
    path: "totalAccount",
    populate: {
      path: "accountGroup",
    },
  });

  if (!accountsReceivableFixed || !salesRevenueFixed) {
    throw new Error(
      "Required accounts (Accounts Receivable or Sales Revenue) are not configured in the chart of accounts."
    );
  }

  const debitEntry = {
    accountGroup: (accountsReceivableFixed as PopulatedFixedAccount).totalAccount.accountGroup
      ._id,
    totalAccount: accountsReceivableFixed.totalAccount._id,
    moin: accountsReceivableFixed._id, // Assuming moin is the fixed account
    account: accountsReceivableFixed._id, // Assuming account is the fixed account
    detailed1: customerId,
    amount,
    currency,
    type: "debit",
    description: `Sale to customer`,
    fiscalYear,
  };

  const creditEntry = {
    accountGroup: (salesRevenueFixed as PopulatedFixedAccount).totalAccount.accountGroup._id,
    totalAccount: salesRevenueFixed.totalAccount._id,
    moin: salesRevenueFixed._id, // Assuming moin is the fixed account
    account: salesRevenueFixed._id, // Assuming account is the fixed account
    amount,
    currency,
    type: "credit",
    description: `Sales revenue`,
    fiscalYear,
  };

  const dailyBookEntry = {
    documentNumber,
    date: new Date(),
    entries: [debitEntry, creditEntry],
    description,
    createdBy: userId,
    status: "posted", // Or 'draft' depending on workflow
  };

  const response = await fetch("/api/dailyBook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dailyBookEntry),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create daily book entry");
  }

  return await response.json();
}
