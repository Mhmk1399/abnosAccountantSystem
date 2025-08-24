import AccountGroup from "@/models/accounts/accountGroup";
import TotalAccount from "@/models/accounts/totalAccount";
import FixedAccount from "@/models/accounts/fixedAccounts";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import dbConnect from "./dbConnect";

/**
 * Generates the next available 2-character code for an AccountGroup.
 * @returns {Promise<string>} The next sequential code.
 */
export async function generateAccountGroupCode(): Promise<string> {
  await dbConnect();
  const lastAccountGroup = await AccountGroup.findOne().sort({ code: -1 });

  let nextCode = 1;
  if (lastAccountGroup && lastAccountGroup.code) {
    nextCode = parseInt(lastAccountGroup.code, 10) + 1;
  }

  return nextCode.toString().padStart(2, "0");
}

/**
 * Generates the next available 4-character code for a TotalAccount within a specific AccountGroup.
 * @param {string} accountGroupId - The ID of the parent AccountGroup.
 * @returns {Promise<string>} The next sequential code.
 */
export async function generateTotalAccountCode(accountGroupId: string): Promise<string> {
  await dbConnect();
  const parentAccountGroup = await AccountGroup.findById(accountGroupId);
  if (!parentAccountGroup) {
    throw new Error("Parent AccountGroup not found.");
  }

  const lastTotalAccount = await TotalAccount.findOne({ accountGroup: accountGroupId }).sort({ code: -1 });

  let nextSequence = 1;
  if (lastTotalAccount && lastTotalAccount.code) {
    const lastSequence = parseInt(lastTotalAccount.code.substring(2), 10);
    nextSequence = lastSequence + 1;
  }

  const newSequence = nextSequence.toString().padStart(2, "0");
  return `${parentAccountGroup.code}${newSequence}`;
}

/**
 * Generates the next available 6-character code for a FixedAccount within a specific TotalAccount.
 * @param {string} totalAccountId - The ID of the parent TotalAccount.
 * @returns {Promise<string>} The next sequential code.
 */
export async function generateFixedAccountCode(totalAccountId: string): Promise<string> {
  await dbConnect();
  const parentTotalAccount = await TotalAccount.findById(totalAccountId);
  if (!parentTotalAccount) {
    throw new Error("Parent TotalAccount not found.");
  }

  const lastFixedAccount = await FixedAccount.findOne({ totalAccount: totalAccountId }).sort({ code: -1 });

  let nextSequence = 1;
  if (lastFixedAccount && lastFixedAccount.code) {
    const lastSequence = parseInt(lastFixedAccount.code.substring(4), 10);
    nextSequence = lastSequence + 1;
  }

  const newSequence = nextSequence.toString().padStart(2, "0");
  return `${parentTotalAccount.code}${newSequence}`;
}

/**
 * Generates the next available 8-character code for a DetailedAccount in sequential order.
 * All detailed accounts are numbered sequentially regardless of which fixed account they belong to.
 * @returns {Promise<string>} The next sequential code.
 */
export async function generateDetailedAccountCode(): Promise<string> {
  await dbConnect();
  
  const lastDetailedAccount = await DetailedAccount.findOne().sort({ code: -1 });

  let nextSequence = 1;
  if (lastDetailedAccount && lastDetailedAccount.code) {
    const codeNumber = parseInt(lastDetailedAccount.code, 10);
    nextSequence = codeNumber + 1;
  }

  return nextSequence.toString().padStart(8, "0");
}