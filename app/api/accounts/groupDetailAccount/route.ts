import { NextResponse, NextRequest } from "next/server";
import GroupDetailAccount from "@/models/accounts/groupDetailAccount";
import connect from "@/lib/data";

// GET: Get all or one group detail account
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const groupDetailAccount = await GroupDetailAccount.findById(id).populate("detailedAccounts");
      if (!groupDetailAccount) {
        return NextResponse.json(
          { error: "Group detail account not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ groupDetailAccount });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const groupDetailAccounts = await GroupDetailAccount.find()
      .populate("detailedAccounts")
      .sort({ createdAt: -1 });
    return NextResponse.json({ groupDetailAccounts });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a group detail account
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const groupDetailAccount = await GroupDetailAccount.create(body);
    return NextResponse.json({ groupDetailAccount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a group detail account
export const PATCH = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required in headers" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const groupDetailAccount = await GroupDetailAccount.findByIdAndUpdate(id, body, { new: true });
    if (!groupDetailAccount) {
      return NextResponse.json(
        { error: "Group detail account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ groupDetailAccount });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a group detail account
export const DELETE = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required in headers" },
      { status: 400 }
    );
  }

  try {
    const groupDetailAccount = await GroupDetailAccount.findByIdAndDelete(id);
    if (!groupDetailAccount) {
      return NextResponse.json(
        { error: "Group detail account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Group detail account deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};