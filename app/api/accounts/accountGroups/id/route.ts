import { NextResponse, NextRequest } from "next/server";
import AccountGroup from "@/models/accounts/accountGroup";
import TotalAccount from "@/models/accounts/totalAccount";
import connect from "@/lib/data";

// PATCH: Update an account group by ID
export const PATCH = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");

  try {
    const body = await req.json();
    const accountGroup = await AccountGroup.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!accountGroup) {
      return NextResponse.json(
        { error: "Account group not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ accountGroup });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete an account group by ID
export const DELETE = async (req: NextRequest) => {
  await connect();
  const id = req.headers.get("id");
  try {
    const childCount = await TotalAccount.countDocuments({ accountGroup: id });
    if (childCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete account group with children. Please delete child accounts first.",
        },
        { status: 400 }
      );
    }

    const accountGroup = await AccountGroup.findByIdAndDelete(id);
    if (!accountGroup) {
      return NextResponse.json(
        { error: "Account group not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Account group deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
