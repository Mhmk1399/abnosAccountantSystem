import { NextResponse, NextRequest } from "next/server";
import Salary from "@/models/salaryandpersonels/salary"; // Correctly import the new Salary model
import connect from "@/lib/data";

// GET: Get all salaries or a single salary entry, with staff details populated
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.nextUrl.searchParams.get("id");
  const staffId = req.nextUrl.searchParams.get("staffId");

  try {
    if (id) {
      // Fetch a single salary by its ID and populate staff details
      const salary = await Salary.findById(id).populate("staff");
      if (!salary) {
        return NextResponse.json(
          { error: "Salary entry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ salary });
    } else if (staffId) {
      // Fetch all salaries for a specific staff member
      const salaries = await Salary.find({ staff: staffId }).populate("staff");
      return NextResponse.json({ salaries });
    } else {
      // Fetch all salaries for all staff
      const salaries = await Salary.find().populate("staff");
      return NextResponse.json({ salaries });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// POST: Create a new salary entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    // Ensure required fields are present
    if (!body.staff || !body.month || !body.year || !body.baseSalary) {
      return NextResponse.json(
        { error: "Missing required fields for salary creation" },
        { status: 400 }
      );
    }
    const newSalary = await Salary.create(body);
    return NextResponse.json({ salary: newSalary }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// PATCH: Update a salary entry by its ID
export const PATCH = async (req: NextRequest) => {
  await connect();

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Salary ID is required as a query parameter" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const updatedSalary = await Salary.findByIdAndUpdate(id, body, {
      new: true,
    }).populate("staff");
    if (!updatedSalary) {
      return NextResponse.json(
        { error: "Salary entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ salary: updatedSalary });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};

// DELETE: Delete a salary entry by its ID
export const DELETE = async (req: NextRequest) => {
  await connect();

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Salary ID is required as a query parameter" },
      { status: 400 }
    );
  }

  try {
    const deletedSalary = await Salary.findByIdAndDelete(id);
    if (!deletedSalary) {
      return NextResponse.json(
        { error: "Salary entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Salary entry deleted successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred: " + errorMessage },
      { status: 500 }
    );
  }
};
