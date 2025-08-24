import {  NextResponse } from "next/server";
import connect from "@/lib/data";
import accountsBalance from "@/models/accounts/accountsBalance";

export async function GET() {
  await connect();

  const allBalances = await accountsBalance.find({});

  return NextResponse.json({ allBalances });
}
