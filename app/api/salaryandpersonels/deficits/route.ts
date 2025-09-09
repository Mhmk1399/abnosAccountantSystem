import { NextResponse, NextRequest } from "next/server";
import deficit from "@/models/salaryandpersonels/deficit";
import connect from "@/lib/data";

// GET: Get all or one deficit entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const deficitEntry = await deficit.findById(id).populate('staff');
      if (!deficitEntry) {
        return NextResponse.json(
          { error: "Deficit entry not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ deficit: deficitEntry });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const deficits = await deficit.find().populate('staff');
    return NextResponse.json({ deficit: deficits });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a deficit entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const deficitEntry = await deficit.create(body);
    return NextResponse.json({ deficit: deficitEntry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a deficit entry
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
    const deficitEntry = await deficit.findByIdAndUpdate(id, body, { new: true });
    if (!deficitEntry) {
      return NextResponse.json(
        { error: "Deficit entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ deficit: deficitEntry });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a deficit entry
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
    const deficitEntry = await deficit.findByIdAndDelete(id);
    if (!deficitEntry) {
      return NextResponse.json(
        { error: "Deficit entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Deficit entry deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};