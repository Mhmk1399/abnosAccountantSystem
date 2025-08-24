import { NextResponse, NextRequest } from "next/server";
import TypeOfDailyBook from "@/models/typeOfDailyBook";
import connect from "@/lib/data";

// GET: Get all typeOfDailyBook entries or a single entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  try {
    if (id) {
      const typeOfDailyBook = await TypeOfDailyBook.findById(id)
        .populate("savedDebitAccount")
        .populate("savedCreditAccount");
      if (!typeOfDailyBook) {
        return NextResponse.json(
          { error: "TypeOfDailyBook entry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ typeOfDailyBook });
    } else {
      const typeOfDailyBooks = await TypeOfDailyBook.find()
        .populate("savedDebitAccount")
        .populate("savedCreditAccount");
      return NextResponse.json({ typeOfDailyBooks });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// POST: Create a new typeOfDailyBook entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Missing required fields for typeOfDailyBook creation" },
        { status: 400 }
      );
    }

    // Parse comma-separated strings for description arrays
    if (typeof body.debitSampleDescriptions === "string") {
      body.debitSampleDescriptions = body.debitSampleDescriptions
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    }
    if (typeof body.creditSampleDescriptions === "string") {
      body.creditSampleDescriptions = body.creditSampleDescriptions
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    }

    const newTypeOfDailyBook = await TypeOfDailyBook.create(body);
    return NextResponse.json(
      { typeOfDailyBook: newTypeOfDailyBook },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// PATCH: Update a typeOfDailyBook entry by its ID
export const PATCH = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "TypeOfDailyBook ID is required as a query parameter" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Handle description arrays - append new descriptions to existing ones
    if (typeof body.debitSampleDescriptions === "string") {
      const newDescriptions = body.debitSampleDescriptions
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s);
      const existing = await TypeOfDailyBook.findById(id);
      body.debitSampleDescriptions = [
        ...(existing?.debitSampleDescriptions || []),
        ...newDescriptions,
      ];
    }
    if (typeof body.creditSampleDescriptions === "string") {
      const newDescriptions = body.creditSampleDescriptions
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s);
      const existing = await TypeOfDailyBook.findById(id);
      body.creditSampleDescriptions = [
        ...(existing?.creditSampleDescriptions || []),
        ...newDescriptions,
      ];
    }

    const updatedTypeOfDailyBook = await TypeOfDailyBook.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
      }
    )
      .populate("savedDebitAccount")
      .populate("savedCreditAccount");
    if (!updatedTypeOfDailyBook) {
      return NextResponse.json(
        { error: "TypeOfDailyBook entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ typeOfDailyBook: updatedTypeOfDailyBook });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// DELETE: Delete a typeOfDailyBook entry by its ID
export const DELETE = async (req: NextRequest) => {
  await connect();

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "TypeOfDailyBook ID is required as a query parameter" },
      { status: 400 }
    );
  }

  try {
    const deletedTypeOfDailyBook = await TypeOfDailyBook.findByIdAndDelete(id);
    if (!deletedTypeOfDailyBook) {
      return NextResponse.json(
        { error: "TypeOfDailyBook entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "TypeOfDailyBook entry deleted successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};
