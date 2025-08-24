import { NextResponse, NextRequest } from "next/server";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import connect from "@/lib/data";
import detailedAcounts from "@/models/accounts/detailedAcounts";
// PATCH: Update a fixed account by ID
export const PATCH = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");
  try {
    const body = await req.json();
    const detailedAccount = await detailedAcounts.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!detailedAccount) {
      return NextResponse.json(
        { error: "Fixed account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ detailedAccount });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a fixed account by ID
export const DELETE = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");
  try {
   

    const detailedAccount = await DetailedAccount.findByIdAndDelete(id);
    if (!detailedAccount) {
      return NextResponse.json(
        { error: "Fixed account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "detailed account deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
