import { NextRequest, NextResponse } from "next/server";
import CashTransaction from "@/models/transactions/cashTransaction";
import connect from "@/lib/data";

// Define types for MongoDB query filters
interface NumberFilter {
  $gte?: number;
  $lte?: number;
}

interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

interface CashTransactionFilter {
  paidBy?: string;
  payTo?: string;
  type?: string;
  description?: { $regex: string; $options: string };
  amount?: NumberFilter;
  transactionDate?: DateFilter;
}

// GET: Retrieve cash transactions with pagination and filtering
export const GET = async (req: NextRequest) => {
  await connect();

  // Check if an ID is provided in the headers
  const id = req.headers.get("id");

  // If ID is provided, return a specific cash transaction
  if (id) {
    try {
      const cashTransaction = await CashTransaction.findById(id)
        .populate("paidBy", "name")
        .populate("payTo", "name");
      if (!cashTransaction) {
        return NextResponse.json(
          { error: "Cash transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ cashTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Get query parameters for pagination and filtering
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
    const paidByFilter = searchParams.get("paidByFilter");
    const payToFilter = searchParams.get("payToFilter");
    const typeFilter = searchParams.get("typeFilter");
    const descriptionFilter = searchParams.get("descriptionFilter");
    const amountFromFilter = searchParams.get("amountFromFilter");
    const amountToFilter = searchParams.get("amountToFilter");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build filter object
    const filter: CashTransactionFilter = {};

    if (paidByFilter) {
      filter.paidBy = paidByFilter;
    }

    if (payToFilter) {
      filter.payTo = payToFilter;
    }

    if (typeFilter) {
      filter.type = typeFilter;
    }

    if (descriptionFilter) {
      filter.description = { $regex: descriptionFilter, $options: "i" };
    }

    if (amountFromFilter || amountToFilter) {
      filter.amount = {};
      if (amountFromFilter) {
        const from = parseFloat(amountFromFilter);
        if (!isNaN(from)) {
          filter.amount.$gte = from;
        }
      }
      if (amountToFilter) {
        const to = parseFloat(amountToFilter);
        if (!isNaN(to)) {
          filter.amount.$lte = to;
        }
      }
    }

    if (dateFrom || dateTo) {
      filter.transactionDate = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          fromDate.setHours(0, 0, 0, 0);
          filter.transactionDate.$gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filter.transactionDate.$lte = toDate;
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalRecords = await CashTransaction.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch cash transactions with pagination and filtering
    const cashTransactions = await CashTransaction.find(filter)
      .populate("paidBy", "name code")
      .populate("payTo", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      cashTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new cash transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const cashTransaction = await CashTransaction.create(body);
    return NextResponse.json({ cashTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a cash transaction by ID
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
    const cashTransaction = await CashTransaction.findByIdAndUpdate(id, body, {
      new: true,
    })
      .populate("paidBy", "name code")
      .populate("payTo", "name code");
    if (!cashTransaction) {
      return NextResponse.json(
        { error: "Cash transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ cashTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a cash transaction by ID
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
    const cashTransaction = await CashTransaction.findByIdAndDelete(id);
    if (!cashTransaction) {
      return NextResponse.json(
        { error: "Cash transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Cash transaction deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
