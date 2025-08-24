import { NextResponse, NextRequest } from "next/server";
import SalaryLaws from "@/models/salaryandpersonels/salaryLaws";
import connect from "@/lib/data";

// GET: Get all or one salary laws entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");
  const year = req.headers.get("year");

  if (id) {
    try {
      const salaryLaws = await SalaryLaws.findById(id);
      if (!salaryLaws) {
        return NextResponse.json(
          { error: "Salary laws not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ salaryLaws });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  if (year) {
    try {
      const salaryLaws = await SalaryLaws.findOne({ year: parseInt(year) });
      if (!salaryLaws) {
        return NextResponse.json(
          { error: "Salary laws not found for this year" },
          { status: 404 }
        );
      }
      return NextResponse.json({ salaryLaws });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const salaryLaws = await SalaryLaws.find().sort({ year: -1 });
    return NextResponse.json({ salaryLaws });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a salary laws entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const salaryLaws = await SalaryLaws.create(body);
    return NextResponse.json({ salaryLaws }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a salary laws entry
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
    const salaryLaws = await SalaryLaws.findByIdAndUpdate(id, body, { new: true });
    if (!salaryLaws) {
      return NextResponse.json(
        { error: "Salary laws not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ salaryLaws });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a salary laws entry
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
    const salaryLaws = await SalaryLaws.findByIdAndDelete(id);
    if (!salaryLaws) {
      return NextResponse.json(
        { error: "Salary laws not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Salary laws deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};