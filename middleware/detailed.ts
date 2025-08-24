import { generateDetailedAccountCode } from "@/lib/codeGenerator";
import connect from "@/lib/data";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import { NextResponse } from "next/server";


export async function createDetailed(req: Request) {
  await connect();

 try {
        const body = await req.json();
        const code = await generateDetailedAccountCode();
        const detailedAccount = await DetailedAccount.create({ ...body, code });
        return NextResponse.json({ detailedAccount }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }

  
}