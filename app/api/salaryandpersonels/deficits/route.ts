import { NextResponse, NextRequest } from "next/server";
import deficit from "@/models/salaryandpersonels/deficit";
import connect from "@/lib/data";

// GET: Get all or one deficit entry with filters and pagination
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
    const { searchParams } = new URL(req.url);
    
    // Build filter query
    const filter: Record<string, unknown> = {};
    
    // Handle staff filter (search by name)
    const staff = searchParams.get('staff');
    if (staff) {
      // First find staff members matching the name
      const staffModel = await import('@/models/salaryandpersonels/staff');
      const matchingStaff = await staffModel.default.find({
        name: { $regex: staff, $options: 'i' }
      }).select('_id');
      
      if (matchingStaff.length > 0) {
        filter.staff = { $in: matchingStaff.map(s => s._id) };
      } else {
        // If no staff found, return empty result
        filter.staff = null;
      }
    }
    
    // Handle type filter
    const type = searchParams.get('type');
    if (type) {
      filter.type = type;
    }
    
    // Handle year filter
    const year = searchParams.get('year');
    if (year) {
      filter.year = parseInt(year);
    }
    
    // Handle month filter
    const month = searchParams.get('month');
    if (month) {
      filter.month = parseInt(month);
    }
    
    // Pagination - with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalItems = await deficit.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch data with filters and pagination
    const deficits = await deficit.find(filter)
      .populate('staff')
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
      deficit: deficits,
      pagination 
    });
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