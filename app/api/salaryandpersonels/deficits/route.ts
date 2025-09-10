import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import deficit from "@/models/salaryandpersonels/deficit";

// Define types for MongoDB query filters
interface NumberFilter {
  $gte?: number;
  $lte?: number;
}

interface DeficitFilter {
  staff?: string;
  type?: string;
  amount?: NumberFilter;
}

// GET: Get all or one deficit entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const deficitEntry = await deficit.findById(id).populate("staff");
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
    // Safely handle req.url
    if (!req.url) {
      return NextResponse.json(
        { error: "Request URL is undefined" },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: DeficitFilter = {};

    // Staff filter
    const staffFilter = searchParams.get("staff.name");
    if (staffFilter) {
      filter.staff = staffFilter;
    }

    // Type filter
    const typeFilter = searchParams.get("type");
    if (typeFilter) {
      filter.type = typeFilter;
    }

    // Amount range filter
    const amountFilter = searchParams.get("amount");
    if (amountFilter) {
      try {
        const [min, max] = JSON.parse(amountFilter) as [
          number | undefined,
          number | undefined
        ];
        if (min !== undefined || max !== undefined) {
          filter.amount = {};
          if (min !== undefined && !isNaN(min)) {
            filter.amount.$gte = min;
          }
          if (max !== undefined && !isNaN(max)) {
            filter.amount.$lte = max;
          }
        }
      } catch {
        // Invalid JSON, ignore filter
        console.log("Invalid amount filter format");
      }
    }

    const totalItems = await deficit.countDocuments(filter);
    const deficits = await deficit
      .find(filter)
      .populate("staff")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      deficit: deficits,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
    const deficitEntry = await deficit.findByIdAndUpdate(id, body, {
      new: true,
    });
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
