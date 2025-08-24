import { NextResponse, NextRequest } from "next/server";
import TotalAccount from "@/models/accounts/totalAccount";
import dbConnect from "@/lib/dbConnect";
import { generateTotalAccountCode } from "@/lib/codeGenerator";

// GET: Retrieve all total accounts
export const GET = async () => {
    await dbConnect();
    try {
        const totalAccounts = await TotalAccount.find().populate('accountGroup');
        return NextResponse.json({ totalAccounts });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// POST: Create a new total account
export const POST = async (req: NextRequest) => {
    await dbConnect();
    try {
        const body = await req.json();
        const code = await generateTotalAccountCode(body.accountGroup);
        const totalAccount = await TotalAccount.create({ ...body, code });
        return NextResponse.json({ totalAccount }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}