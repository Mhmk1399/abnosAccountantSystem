import { NextResponse, NextRequest } from "next/server";
import FixedAccount from "@/models/accounts/fixedAccounts";
import dbConnect from "@/lib/dbConnect";
import { generateFixedAccountCode } from "@/lib/codeGenerator";

// GET: Retrieve all fixed accounts
export const GET = async () => {
  await dbConnect();
  try {
    const fixedAccounts = await FixedAccount.find().populate("totalAccount");
    return NextResponse.json({ fixedAccounts });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new fixed account or add detailed accounts
export const POST = async (req: NextRequest) => {
  await dbConnect();
  try {
    const body = await req.json();
    const fixedAccountId = req.headers.get("fixedAccountId");
    
    // If fixedAccountId is provided, add detailed accounts
    if (fixedAccountId && body.detailedAccountIds) {
      const fixedAccount = await FixedAccount.findById(fixedAccountId);
      if (!fixedAccount) {
        return NextResponse.json(
          { error: "Fixed account not found" },
          { status: 404 }
        );
      }
      
      const existingIds = fixedAccount.detailedAccounts.map((id: string) => id.toString());
      const newIds = body.detailedAccountIds.filter((id: string) => !existingIds.includes(id));
      
      if (newIds.length === 0) {
        return NextResponse.json(
          { error: "All selected accounts are already assigned" },
          { status: 400 }
        );
      }
      
      const updatedFixedAccount = await FixedAccount.findByIdAndUpdate(
        fixedAccountId,
        { $addToSet: { detailedAccounts: { $each: newIds } } },
        { new: true }
      ).populate('detailedAccounts').populate('totalAccount');
      
      return NextResponse.json({ 
        fixedAccount: updatedFixedAccount,
        addedCount: newIds.length 
      });
    }
    
    // Otherwise, create new fixed account
    const code = await generateFixedAccountCode(body.totalAccount);
    const fixedAccount = await FixedAccount.create({ ...body, code });
    return NextResponse.json({ fixedAccount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
