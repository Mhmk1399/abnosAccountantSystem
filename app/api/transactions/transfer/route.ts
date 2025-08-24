import { NextResponse, NextRequest } from "next/server";
import TransferTransaction from "@/models/transactions/transferTransaction";
import connect from "@/lib/data";

// GET: Retrieve all transfer transactions
export const GET = async (req: NextRequest) => {
  await connect();

  // Check if an ID is provided in the headers
  const id = req.headers.get("id");

  // If ID is provided, return a specific transfer transaction
  if (id) {
    try {
      const transferTransaction = await TransferTransaction.findById(id)
        .populate("ourBank")
        .populate("paidBy")
        .populate("payTo");
      if (!transferTransaction) {
        return NextResponse.json(
          { error: "Transfer transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ transferTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Otherwise, return all transfer transactions
  try {
    const transferTransactions = await TransferTransaction.find()
      .populate("ourBank")
      .populate("paidBy")
      .populate("payTo");
    return NextResponse.json({ transferTransactions });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new transfer transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const transferTransaction = await TransferTransaction.create(body);
    return NextResponse.json({ transferTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a transfer transaction by ID
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
    const transferTransaction = await TransferTransaction.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
      }
    );
    if (!transferTransaction) {
      return NextResponse.json(
        { error: "Transfer transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ transferTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a transfer transaction by ID
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
    const transferTransaction = await TransferTransaction.findByIdAndDelete(id);
    if (!transferTransaction) {
      return NextResponse.json(
        { error: "Transfer transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Transfer transaction deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
