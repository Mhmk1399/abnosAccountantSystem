import { NextResponse, NextRequest } from "next/server";
import CashTransaction from "@/models/transactions/cashTransaction";
import connect from "@/lib/data";

// GET: Retrieve all cash transactions
export const GET = async (req: NextRequest) => {
  await connect();

  // Check if an ID is provided in the headers
  const id = req.headers.get("id");

  // If ID is provided, return a specific cash transaction
  if (id) {
    try {
      const cashTransaction = await CashTransaction.findById(id)
        .populate('paidBy', 'name ')
        .populate('payTo', 'name ');
      if (!cashTransaction) {
        return NextResponse.json(
          { error: "Cash transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ cashTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Otherwise, return all cash transactions
  try {
    const cashTransactions = await CashTransaction.find()
      .populate('paidBy', 'name code')
      .populate('payTo', 'name code');
    return NextResponse.json({ cashTransactions });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new cash transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const cashTransaction = await CashTransaction.create(body);
    return NextResponse.json({ cashTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a cash transaction by ID
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
    const cashTransaction = await CashTransaction.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!cashTransaction) {
      return NextResponse.json(
        { error: "Cash transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ cashTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a cash transaction by ID
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
    const cashTransaction = await CashTransaction.findByIdAndDelete(id);
    if (!cashTransaction) {
      return NextResponse.json(
        { error: "Cash transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Cash transaction deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
