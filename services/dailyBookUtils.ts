import { createDailyBookEntry } from "./dailyBookCreatorService";

interface ManualDailyBookParams {
  debitAccountGroup: string;
  debitTotalAccount: string;
  debitFixedAccount: string;
  debitDetailed?: string;
  creditAccountGroup: string;
  creditTotalAccount: string;
  creditFixedAccount: string;
  creditDetailed?: string;
  amount: number;
  description: string;
  documentNumber?: string;
  date?: Date;
}

export const createManualDailyBook = async (params: ManualDailyBookParams) => {
  const debitEntry = {
    accountGroup: params.debitAccountGroup,
    totalAccount: params.debitTotalAccount,
    fixedAccounts: params.debitFixedAccount,
    amount: params.amount,
    description: params.description,
    detailed1: params.debitDetailed,
  };

  const creditEntry = {
    accountGroup: params.creditAccountGroup,
    totalAccount: params.creditTotalAccount,
    fixedAccounts: params.creditFixedAccount,
    amount: params.amount,
    description: params.description,
    detailed1: params.creditDetailed,
  };

  return await createDailyBookEntry({
    debitEntry,
    creditEntry,
    description: params.description,
    documentNumber: params.documentNumber,
    date: params.date
  });
};