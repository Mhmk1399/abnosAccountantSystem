import { NextResponse } from "next/server";
import connect from "@/lib/data";
import TotalAccount from "@/models/accounts/totalAccount";

export async function POST() {
  try {
    // اطمینان از اتصال به MongoDB
    await connect();

    // آپدیت تمام اسناد فاقد فیلد fiscalType
    const result = await TotalAccount.updateMany(
      { fiscalType: { $exists: false } }, // ✅ only update docs missing the field
      { $set: { fiscalType: "permanat" } }
    );

    return NextResponse.json({
      message: "fiscalType field added successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log("Error updating account groups:", error);
    return NextResponse.json(
      {
        message: "Failed to update account groups",
      },
      { status: 500 }
    );
  }
}
