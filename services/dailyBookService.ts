import DailyBook from "@/models/dailyBook";
import TypeOfDailyBook from "@/models/typeOfDailyBook";
import { findFixedAccountByDetailedId } from "./accountService";
import { findFiscalYearByDate } from "./fiscalYearService";
import { createDailyBookEntry } from "./dailyBookCreatorService";

export const createDailyBookEntryForInvoice = async (invoice: any) => {
  try {
    const customerDetailedAccountId = invoice.customer?.detailedAcount;
    if (!customerDetailedAccountId) {
      throw new Error("Customer detailed account not found");
    }

    const accountData = await findFixedAccountByDetailedId(customerDetailedAccountId);
    if (!accountData) {
      throw new Error("Account data not found");
    }

    const saleType = await TypeOfDailyBook.findOne({ name: "sale" });
    if (!saleType) {
      throw new Error("Sale type not found in TypeOfDailyBook");
    }

    const debitEntry = {
      accountGroup: accountData.totalAccount.accountGroup._id,
      totalAccount: accountData.totalAccount._id,
      fixedAccounts: accountData._id,
      amount: invoice.price,
      description: `فروش شیشه - فاکتور ${invoice.code}`,
      detailed1: customerDetailedAccountId,
    };

    const creditEntry = {
      accountGroup: saleType.savedCreditAccount?.totalAccount?.accountGroup?._id,
      totalAccount: saleType.savedCreditAccount?.totalAccount?._id,
      fixedAccounts: saleType.savedCreditAccount?._id,
      amount: invoice.price,
      description: `فروش شیشه - فاکتور ${invoice.code}`,
    };

    return await createDailyBookEntry({
      debitEntry,
      creditEntry,
      description: `ثبت فروش فاکتور ${invoice.code} - مشتری: ${invoice.customer?.name || 'نامشخص'}`,
      typeOfDailyBook: saleType._id,
      documentNumber: `INV-${invoice.code}-${Date.now()}`,
    });
  } catch (error) {
    console.error("Error creating daily book entry:", error);
    throw error;
  }
};