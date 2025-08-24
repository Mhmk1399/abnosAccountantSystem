import { NextResponse, NextRequest } from "next/server";
import Loanes from "@/models/transactions/loanes";
import connect from "@/lib/data";

// GET: Get all or one loan entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const loan = await Loanes.findById(id).populate('bank').populate('paidperson');
      if (!loan) {
        return NextResponse.json(
          { error: "Loan entry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ loan });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const loanes = await Loanes.find().populate('bank').populate('paidperson');
    return NextResponse.json({ loanes });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a loan entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const loan = await Loanes.create(body);
    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a loan entry
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
    const loan = await Loanes.findByIdAndUpdate(id, body, { new: true }).populate('bank').populate('paidperson');
    if (!loan) {
      return NextResponse.json(
        { error: "Loan entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ loan });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a loan entry
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
    const loan = await Loanes.findByIdAndDelete(id);
    if (!loan) {
      return NextResponse.json(
        { error: "Loan entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Loan entry deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};