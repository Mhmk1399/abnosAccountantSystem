import { NextResponse, NextRequest } from "next/server";
import FixedAccount from "@/models/accounts/fixedAccounts";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import connect from "@/lib/data";
// PATCH: Update a fixed account by ID
export const PATCH = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");
  try {
    const body = await req.json();
    const fixedAccount = await FixedAccount.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!fixedAccount) {
      return NextResponse.json(
        { error: "Fixed account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ fixedAccount });
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
    const childCount = await DetailedAccount.countDocuments({
      fixedAccount: id,
    });
    if (childCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete fixed account with children. Please delete child accounts first.",
        },
        { status: 400 }
      );
    }

    const fixedAccount = await FixedAccount.findByIdAndDelete(id);
    if (!fixedAccount) {
      return NextResponse.json(
        { error: "Fixed account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Fixed account deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
