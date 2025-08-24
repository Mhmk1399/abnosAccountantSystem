import DailyBook from "@/models/dailyBook";
import TypeOfDailyBook from "@/models/typeOfDailyBook";
import { findFixedAccountByDetailedId } from "./accountService";
import { findFiscalYearByDate } from "./fiscalYearService";

export const createDailyBookEntryForInvoice = async (invoice: any) => {
  try {
    // Get customer's detailed account info
    const customerDetailedAccountId = invoice.customer?.detailedAcount;
    if (!customerDetailedAccountId) {
      throw new Error("Customer detailed account not found");
    }

    const accountData = await findFixedAccountByDetailedId(customerDetailedAccountId);
    if (!accountData) {
      throw new Error("Account data not found");
    }

    // Get sale type from TypeOfDailyBook
    const saleType = await TypeOfDailyBook.findOne({ name: "sale" });
    if (!saleType) {
      throw new Error("Sale type not found in TypeOfDailyBook");
    }

    // Get fiscal year
    const fiscalYear = await findFiscalYearByDate( new Date());
    if (!fiscalYear) {
      throw new Error("Fiscal year not found");
    }

    // Generate document number
    const documentNumber = `INV-${invoice.code}-${Date.now()}`;

    // Create daily book entry
    const dailyBookEntry = new DailyBook({
      documentNumber,
      date: new Date(),
      entries: [
        {
          accountGroup: accountData.totalAccount.accountGroup._id,
          totalAccount: accountData.totalAccount._id,
          fixedAccounts: accountData._id,
          detailedAcounts: customerDetailedAccountId,
          amount: invoice.price,
          type: saleType._id,
          description: `فروش شیشه - فاکتور ${invoice.code}`,
          reference: invoice.code,
          fiscalYear: fiscalYear._id,
        }
      ],
      description: `ثبت فروش فاکتور ${invoice.code} - مشتری: ${invoice.customer?.name || 'نامشخص'}`,
      status: "draft"
    });

    await dailyBookEntry.save();
    return dailyBookEntry;
  } catch (error) {
    console.error("Error creating daily book entry:", error);
    throw error;
  }
};