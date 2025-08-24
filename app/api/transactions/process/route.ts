import { NextRequest, NextResponse } from "next/server";
import { processTransaction } from "@/services/transActionService";
import connect from "@/lib/data";
export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    console.log("📥 Received transaction request:", {
      payType: body.payType,
      amount: body.transactionData?.amount,
    });

    const result = await processTransaction(body);

    console.log("✅ Transaction processed successfully");
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Transaction processing error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to process transaction" },
      { status: 500 }
    );
  }
}
