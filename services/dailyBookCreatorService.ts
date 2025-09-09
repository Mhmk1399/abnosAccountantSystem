import DailyBook from "@/models/dailyBook";
import TypeOfDailyBook from "@/models/typeOfDailyBook";
import { findFiscalYearByDate } from "./fiscalYearService";
import {
  findFixedAccountByDetailedId,
  findFixedAccountByDetailedIdDirect,
} from "./accountService";

interface DailyBookEntry {
  accountGroup: string;
  totalAccount: string;
  fixedAccounts: string;
  amount: number;
  description: string;
  detailed1?: string;
  detailed2?: string;
}

interface CreateDailyBookParams {
  debitEntry: DailyBookEntry;
  creditEntry: DailyBookEntry;
  description: string;
  typeOfDailyBook?: string;
  documentNumber?: string;
  date?: Date;
}

export const createDailyBookEntry = async (params: CreateDailyBookParams) => {
  try {
    const {
      debitEntry,
      creditEntry,
      description,
      typeOfDailyBook,
      documentNumber,
      date = new Date(),
    } = params;

    // Validate required fields
    if (
      !debitEntry.accountGroup ||
      !debitEntry.totalAccount ||
      !debitEntry.fixedAccounts
    ) {
      throw new Error("Debit entry missing required account fields");
    }

    if (
      !creditEntry.accountGroup ||
      !creditEntry.totalAccount ||
      !creditEntry.fixedAccounts
    ) {
      throw new Error("Credit entry missing required account fields");
    }

    // Get fiscal year
    const fiscalYear = await findFiscalYearByDate(date);
    if (!fiscalYear) {
      throw new Error("Fiscal year not found");
    }

    // Generate document number if not provided
    const docNumber = documentNumber || `DB-${Date.now()}`;

    console.log("Creating daily book with:", {
      debitEntry: { ...debitEntry, fiscalYear: fiscalYear._id },
      creditEntry: { ...creditEntry, fiscalYear: fiscalYear._id },
    });

    // Create daily book entry
    const dailyBookEntry = new DailyBook({
      documentNumber: docNumber,
      date,
      debitEntries: [
        {
          ...debitEntry,
          fiscalYear: fiscalYear._id,
        },
      ],
      creditEntries: [
        {
          ...creditEntry,
          fiscalYear: fiscalYear._id,
        },
      ],
      description,
      type: typeOfDailyBook,
      status: "draft",
    });

    await dailyBookEntry.save();
    return dailyBookEntry;
  } catch (error) {
    console.error("Error creating daily book entry:", error);
    throw error;
  }
};

export const createDailyBookForCheck = async (checkData: any) => {
  try {
    console.log("Check data received:", checkData);

    const typeOfDailyBook = await TypeOfDailyBook.findOne({ name: "check" });

    if (!checkData.payTo || !checkData.paidBy) {
      throw new Error(
        "Missing required account references: payTo and paidBy are required"
      );
    }

    let debitAccountData, creditAccountData;

    if (checkData.type === "income") {
      debitAccountData =
        (await findFixedAccountByDetailedId(checkData.payTo)) ||
        (await findFixedAccountByDetailedIdDirect(checkData.payTo));
      creditAccountData =
        (await findFixedAccountByDetailedId(checkData.paidBy)) ||
        (await findFixedAccountByDetailedIdDirect(checkData.paidBy));
    } else {
      debitAccountData =
        (await findFixedAccountByDetailedId(checkData.payTo)) ||
        (await findFixedAccountByDetailedIdDirect(checkData.payTo));
      creditAccountData =
        (await findFixedAccountByDetailedId(checkData.paidBy)) ||
        (await findFixedAccountByDetailedIdDirect(checkData.paidBy));
    }

    console.log("Debit account data:", debitAccountData);
    console.log("Credit account data:", creditAccountData);

    if (!debitAccountData || !creditAccountData) {
      console.warn(
        "Account data not found, skipping daily book creation for check:",
        checkData.checkNumber
      );
      return null;
    }

    const debitEntry: DailyBookEntry = {
      accountGroup: debitAccountData.totalAccount.accountGroup._id,
      totalAccount: debitAccountData.totalAccount._id,
      fixedAccounts: debitAccountData._id,
      amount: checkData.amount,
      description: `چک ${
        checkData.type === "income" ? "دریافتی" : "پرداختی"
      } شماره ${checkData.checkNumber}`,
      detailed1:
        checkData.type === "income" ? checkData.payTo : checkData.payTo,
    };

    const creditEntry: DailyBookEntry = {
      accountGroup: creditAccountData.totalAccount.accountGroup._id,
      totalAccount: creditAccountData.totalAccount._id,
      fixedAccounts: creditAccountData._id,
      amount: checkData.amount,
      description: `چک ${
        checkData.type === "income" ? "دریافتی" : "پرداختی"
      } شماره ${checkData.checkNumber}`,
      detailed1:
        checkData.type === "income" ? checkData.paidBy : checkData.paidBy,
    };

    return await createDailyBookEntry({
      debitEntry,
      creditEntry,
      description: `چک ${
        checkData.type === "income" ? "دریافتی" : "پرداختی"
      } شماره ${checkData.checkNumber} - ${checkData.description || ""}`,
      typeOfDailyBook: typeOfDailyBook?._id,
      documentNumber:
        checkData.documentNumber || `CHK-${checkData.checkNumber}`,
      date: checkData.dueDate || checkData.date,
    });
  } catch (error) {
    console.error("Error creating daily book for check:", error);
    throw error;
  }
};

export const createDailyBookFromTypeOfDailyBook = async (params: {
  typeOfDailyBookId: string;
  amount: number;
  description: string;
  debitDetailed?: string;
  creditDetailed?: string;
  documentNumber?: string;
  date?: Date;
}) => {
  try {
    const typeOfDailyBook = await TypeOfDailyBook.findById(
      params.typeOfDailyBookId
    )
      .populate("savedDebitAccount")
      .populate("savedCreditAccount");

    if (!typeOfDailyBook) {
      throw new Error("Type of daily book not found");
    }

    // Resolve debit account hierarchy
    let debitAccountData;
    if (params.debitDetailed) {
      debitAccountData = await findFixedAccountByDetailedId(
        params.debitDetailed
      );
    }

    // Resolve credit account hierarchy
    let creditAccountData;
    if (params.creditDetailed) {
      creditAccountData = await findFixedAccountByDetailedId(
        params.creditDetailed
      );
    }

    const debitEntry: DailyBookEntry = {
      accountGroup:
        debitAccountData?.totalAccount?.accountGroup?._id ||
        typeOfDailyBook.savedDebitAccount?.totalAccount?.accountGroup?._id,
      totalAccount:
        debitAccountData?.totalAccount?._id ||
        typeOfDailyBook.savedDebitAccount?.totalAccount?._id,
      fixedAccounts:
        debitAccountData?._id || typeOfDailyBook.savedDebitAccount?._id,
      amount: params.amount,
      description: params.description,
      detailed1: params.debitDetailed,
    };

    const creditEntry: DailyBookEntry = {
      accountGroup:
        creditAccountData?.totalAccount?.accountGroup?._id ||
        typeOfDailyBook.savedCreditAccount?.totalAccount?.accountGroup?._id,
      totalAccount:
        creditAccountData?.totalAccount?._id ||
        typeOfDailyBook.savedCreditAccount?.totalAccount?._id,
      fixedAccounts:
        creditAccountData?._id || typeOfDailyBook.savedCreditAccount?._id,
      amount: params.amount,
      description: params.description,
      detailed1: params.creditDetailed,
    };

    return await createDailyBookEntry({
      debitEntry,
      creditEntry,
      description: params.description,
      typeOfDailyBook: typeOfDailyBook._id,
      documentNumber: params.documentNumber,
      date: params.date,
    });
  } catch (error) {
    console.error("Error creating daily book from type:", error);
    throw error;
  }
};
