import data from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import FiscalYear from "@/models/fiscalYear";

// GET: Retrieve all fiscal years
export const GET = async () => {
  await data();
  try {
    const fiscalYears = await FiscalYear.find();
    return NextResponse.json({ data: fiscalYears });
  } catch (error) {
    console.error("Error fetching fiscal years:", error);
    return NextResponse.json(
      { error: "Failed to fetch fiscal years" },
      { status: 500 }
    );
  }
};

// POST: Create a new fiscal year
export const POST = async (req: NextRequest) => {
  await data();
  try {
    const body = await req.json();

    // Convert string dates to Date objects
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const fiscalYear = await FiscalYear.create(body);
    return NextResponse.json(fiscalYear, { status: 201 });
  } catch (error) {
    console.error("Error creating fiscal year:", error);

    // Handle duplicate key error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "سال مالی با این نام قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create fiscal year" },
      { status: 500 }
    );
  }
};

// DELETE: Delete a fiscal year by ID
export const DELETE = async (req: NextRequest) => {
  await data();
  try {
    const id = req.headers.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Fiscal year ID is required" },
        { status: 400 }
      );
    }

    const fiscalYear = await FiscalYear.findByIdAndDelete(id);

    if (!fiscalYear) {
      return NextResponse.json(
        { error: "Fiscal year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Fiscal year deleted successfully" });
  } catch (error) {
    console.error("Error deleting fiscal year:", error);
    return NextResponse.json(
      { error: "Failed to delete fiscal year" },
      { status: 500 }
    );
  }
};

// PATCH: Update a fiscal year by ID
export const PATCH = async (req: NextRequest) => {
  await data();
  try {
    const body = await req.json();
    const id = req.headers.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Fiscal year ID is required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    // Add updated timestamp
    body.updatedAt = new Date();

    const fiscalYear = await FiscalYear.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!fiscalYear) {
      return NextResponse.json(
        { error: "Fiscal year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fiscalYear);
  } catch (error) {
    console.error("Error updating fiscal year:", error);

    // Handle duplicate key error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "سال مالی با این نام قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update fiscal year" },
      { status: 500 }
    );
  }
};
