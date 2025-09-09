import { NextResponse, NextRequest } from "next/server";
import DailyBook from "@/models/dailyBook";
import connect from "@/lib/data";
import AccountBalance from "@/models/accounts/accountsBalance";
import { createDailyBookEntry, createDailyBookFromTypeOfDailyBook } from "@/services/dailyBookCreatorService";
// GET: Retrieve all daily books
export const GET = async (req: NextRequest) => {
  await connect();

  // Check if an ID is provided in the headers
  const id = req.headers.get("id");

  // If ID is provided, return a specific daily book
  if (id) {
    try {
      const dailyBook = await DailyBook.findById(id);

      return NextResponse.json({ dailyBook });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }
  // Otherwise, return all daily books
  try {
    const dailyBooks = await DailyBook.find();

    return NextResponse.json({ dailyBooks });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new daily book

export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();

    let dailyBook;
    
    // If using daily book creator service
    if (body.useCreatorService) {
      if (body.typeOfDailyBookId) {
        dailyBook = await createDailyBookFromTypeOfDailyBook({
          typeOfDailyBookId: body.typeOfDailyBookId,
          amount: body.amount,
          description: body.description,
          debitDetailed: body.debitDetailed,
          creditDetailed: body.creditDetailed,
          documentNumber: body.documentNumber,
          date: body.date
        });
      } else if (body.debitEntry && body.creditEntry) {
        dailyBook = await createDailyBookEntry({
          debitEntry: body.debitEntry,
          creditEntry: body.creditEntry,
          description: body.description,
          typeOfDailyBook: body.typeOfDailyBook,
          documentNumber: body.documentNumber,
          date: body.date
        });
      } else {
        throw new Error("Invalid data for creator service");
      }
    } else {
      // Step 1: Create and save the daily book using traditional method
      dailyBook = await DailyBook.create(body);
    }

    // Step 2: If posted (not draft), update account balances
    if (dailyBook.status === "draft") {
      const balanceUpdates: Array<Promise<AccountBalance>> = [];
      // AccountBalance interface based on usage
      interface AccountBalance {
        accountLevel: "group" | "total" | "fixed" | "detailed";
        accountRef: string;
        accountModel: "AccountGroup" | "TotalAccount" | "FixedAccount" | "DetailedAccount";
        fiscalYear: string;
        totalDebit?: number;
        totalCredit?: number;
        net?: number;
        lastUpdated?: Date;
      }
      // Process debit entries
      if (dailyBook.debitEntries && Array.isArray(dailyBook.debitEntries)) {
        for (const entry of dailyBook.debitEntries) {
          const accounts = [
            { id: entry.accountGroup, model: "AccountGroup", level: "group" },
            { id: entry.totalAccount, model: "TotalAccount", level: "total" },
            { id: entry.fixedAccounts, model: "FixedAccount", level: "fixed" },
            { id: entry.detailed1, model: "DetailedAccount", level: "detailed" },
            { id: entry.detailed2, model: "DetailedAccount", level: "detailed" },
          ].filter(acc => acc.id);
          for (const acc of accounts) {
            balanceUpdates.push(
              AccountBalance.findOneAndUpdate(
                {
                  accountLevel: acc.level,
                  accountRef: acc.id,
                  accountModel: acc.model,
                  fiscalYear: entry.fiscalYear,
                },
                {
                  $inc: {
                    totalDebit: entry.amount,
                    net: entry.amount,
                  },
                  $set: { lastUpdated: new Date() },
                },
                { upsert: true, new: true }
              )
            
            );
          }
        }
      }

      // Process credit entries
      if (dailyBook.creditEntries && Array.isArray(dailyBook.creditEntries)) {
        for (const entry of dailyBook.creditEntries) {
          const accounts = [
            { id: entry.accountGroup, model: "AccountGroup", level: "group" },
            { id: entry.totalAccount, model: "TotalAccount", level: "total" },
            { id: entry.fixedAccounts, model: "FixedAccount", level: "fixed" },
            { id: entry.detailed1, model: "DetailedAccount", level: "detailed" },
            { id: entry.detailed2, model: "DetailedAccount", level: "detailed" },
          ].filter(acc => acc.id);

          for (const acc of accounts) {
            balanceUpdates.push(
              AccountBalance.findOneAndUpdate(
                {
                  accountLevel: acc.level,
                  accountRef: acc.id,
                  accountModel: acc.model,
                  fiscalYear: entry.fiscalYear,
                },
                {
                  $inc: {
                    totalCredit: entry.amount,
                    net: -entry.amount,
                  },
                  $set: { lastUpdated: new Date() },
                },
                { upsert: true, new: true }
              )
            );
          }
        }
      }

      await Promise.all(balanceUpdates);
    }

    return NextResponse.json({ dailyBook }, { status: 201 });
  } catch (error) {
    console.error("Error creating daily book:", error);
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
// PATCH: Update a daily book by ID
export const PATCH = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required in headers" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const dailyBook = await DailyBook.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!dailyBook) {
      return NextResponse.json(
        { error: "Daily book not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ dailyBook });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a daily book by ID
export const DELETE = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required in headers" },
      { status: 400 }
    );
  }

  try {
    const dailyBook = await DailyBook.findByIdAndDelete(id);
    if (!dailyBook) {
      return NextResponse.json(
        { error: "Daily book not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Daily book deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
