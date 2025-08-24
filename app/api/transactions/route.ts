import { NextResponse, NextRequest } from "next/server";
import Transaction from "@/models/transactions/transactions";
import connect from "@/lib/data";

// GET: Retrieve all transactions
export const GET = async (req: NextRequest) => {
  await connect();

  // Check if an ID is provided in the headers
  const id = req.headers.get("id");

  // If ID is provided, return a specific transaction
  if (id) {
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ transaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Otherwise, return all transactions
  try {
    const transactions = await Transaction.find();
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const transaction = await Transaction.create(body);
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a transaction by ID
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
    const transaction = await Transaction.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a transaction by ID
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
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
