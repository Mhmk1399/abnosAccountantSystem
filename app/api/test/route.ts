import { processTransaction } from "@/services/transActionService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await processTransaction(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
