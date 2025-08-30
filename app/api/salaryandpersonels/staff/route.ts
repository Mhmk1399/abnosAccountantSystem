import { NextResponse, NextRequest } from "next/server";
import staff from "@/models/salaryandpersonels/staff";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import { generateDetailedAccountCode } from "@/lib/codeGenerator";
import connect from "@/lib/data";

// GET: Get all or one staff entry with filters and pagination
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
    const { searchParams } = new URL(req.url);
    
    // Build filter query
    const filter: Record<string, unknown> = {};
    
    // Handle name filter
    const name = searchParams.get('name');
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    // Handle nationalId filter
    const nationalId = searchParams.get('nationalId');
    if (nationalId) {
      filter.nationalId = { $regex: nationalId, $options: 'i' };
    }
    
    // Handle position filter
    const position = searchParams.get('position');
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }
    
    // Handle isActive filter
    const isActive = searchParams.get('isActive');
    if (isActive === 'true' || isActive === 'false') {
      filter.isActive = isActive === 'true';
    }
    
    // Handle ismaried filter
    const ismaried = searchParams.get('ismaried');
    if (ismaried === 'true' || ismaried === 'false') {
      filter.ismaried = ismaried === 'true';
    }
    
    // Handle date range filters for contracthireDate
    const hireDateFrom = searchParams.get('contracthireDate_from');
    const hireDateTo = searchParams.get('contracthireDate_to');
    if (hireDateFrom || hireDateTo) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (hireDateFrom) dateFilter.$gte = new Date(hireDateFrom);
      if (hireDateTo) dateFilter.$lte = new Date(hireDateTo);
      filter.contracthireDate = dateFilter;
    }
    
    // Pagination - with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalItems = await staff.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch data with filters and pagination
    const staffMembers = await staff.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Build pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
    
    return NextResponse.json({ 
      staff: staffMembers,
      pagination 
    });
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