import { NextResponse, NextRequest } from "next/server";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import { generateDetailedAccountCode } from "@/lib/codeGenerator";
import connect from "@/lib/data";

// GET: Retrieve all detailed accounts
export const GET = async () => {
  await connect();

  try {
    const detailedAccounts = await DetailedAccount.find().sort({ code: 1 });
    return NextResponse.json({ detailedAccounts });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new detailed account
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();

    const code = await generateDetailedAccountCode();
    const detailedAccount = await DetailedAccount.create({ ...body, code });
    return NextResponse.json({ detailedAccount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
