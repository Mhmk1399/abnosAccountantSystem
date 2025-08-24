import { NextResponse, NextRequest } from "next/server";
import connect from "@/lib/data";
import accountsBalance from "@/models/accounts/accountsBalance";

// GET: Get all or one account balance entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const balance = await accountsBalance.findById(id).populate('accountRef');
      if (!balance) {
        return NextResponse.json(
          { error: "Account balance not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ balance });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const balances = await accountsBalance.find().populate('accountRef');
    return NextResponse.json({ balances });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create an account balance entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const balance = await accountsBalance.create(body);
    return NextResponse.json({ balance }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update an account balance entry
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
    const balance = await accountsBalance.findByIdAndUpdate(id, body, { new: true });
    if (!balance) {
      return NextResponse.json(
        { error: "Account balance not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ balance });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete an account balance entry
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
    const balance = await accountsBalance.findByIdAndDelete(id);
    if (!balance) {
      return NextResponse.json(
        { error: "Account balance not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Account balance deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
