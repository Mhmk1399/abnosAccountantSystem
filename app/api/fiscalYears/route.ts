import connect from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import FiscalYear from "@/models/fiscalYear";

// GET: Retrieve all fiscal years with pagination and filtering
export const GET = async (req: NextRequest) => {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter parameters
    const startDateFrom = searchParams.get('startDateFrom');
    const startDateTo = searchParams.get('startDateTo');
    const endDateFrom = searchParams.get('endDateFrom');
    const endDateTo = searchParams.get('endDateTo');
    const taxRateMin = searchParams.get('taxRateMin');
    const taxRateMax = searchParams.get('taxRateMax');
    const name = searchParams.get('name');
    const isActive = searchParams.get('isActive');

    // Build filter object
    const filter: any = {};

    // Name filter (case-insensitive partial match)
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Start date range filter
    if (startDateFrom || startDateTo) {
      filter.startDate = {};
      if (startDateFrom) {
        const fromDate = new Date(startDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filter.startDate.$gte = fromDate;
      }
      if (startDateTo) {
        const toDate = new Date(startDateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.startDate.$lte = toDate;
      }
    }

    // End date range filter
    if (endDateFrom || endDateTo) {
      filter.endDate = {};
      if (endDateFrom) {
        const fromDate = new Date(endDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filter.endDate.$gte = fromDate;
      }
      if (endDateTo) {
        const toDate = new Date(endDateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.endDate.$lte = toDate;
      }
    }

    // Tax rate range filter
    if (taxRateMin || taxRateMax) {
      filter.taxRate = {};
      if (taxRateMin) {
        filter.taxRate.$gte = parseFloat(taxRateMin);
      }
      if (taxRateMax) {
        filter.taxRate.$lte = parseFloat(taxRateMax);
      }
    }

    // Active status filter
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Get total count for pagination
    const totalItems = await FiscalYear.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch filtered and paginated data
    const fiscalYears = await FiscalYear.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return NextResponse.json({ 
      data: fiscalYears,
      pagination 
    });
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
  await connect();
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
  await connect();
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
  await connect();
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
