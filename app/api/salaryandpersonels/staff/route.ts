import { NextResponse, NextRequest } from "next/server";
import staff from "@/models/salaryandpersonels/staff";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import { generateDetailedAccountCode } from "@/lib/codeGenerator";
import connect from "@/lib/data";

// GET: Get all or one staff entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const staffMember = await staff.findById(id);
      if (!staffMember) {
        return NextResponse.json(
          { error: "Staff member not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ staff: staffMember });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    const staffMembers = await staff.find();
    return NextResponse.json({ staff: staffMembers });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a staff entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    
    // Create detailed account for staff
    const code = await generateDetailedAccountCode();
    const detailedAccount = await DetailedAccount.create({
      name: `${body.name} - ${body.position}`,
      description: `حساب تفصیلی پرسنل - ${body.name}`,
      code,
      type: "debit",
      fiscalType: "permanat"
    });
    
    // Create staff with detailed account reference
    const staffMember = await staff.create({
      ...body,
      detailedAccount: detailedAccount._id
    });
    
    return NextResponse.json({ staff: staffMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a staff entry
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
    const staffMember = await staff.findByIdAndUpdate(id, body, { new: true });
    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ staff: staffMember });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a staff entry
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
    const staffMember = await staff.findByIdAndDelete(id);
    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};