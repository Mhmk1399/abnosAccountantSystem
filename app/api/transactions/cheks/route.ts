import { NextResponse, NextRequest } from "next/server";
import CheckTransaction from "@/models/transactions/checkTransaction";
import connect from "@/lib/data";
import { createDailyBookForCheck } from "@/services/dailyBookCreatorService";

// GET: Retrieve check transactions with filtering
export const GET = async (req: NextRequest) => {
  await connect();

  const { searchParams } = new URL(req.url);
  const id = req.headers.get("id");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const accountId = searchParams.get("accountId");
  const checkNumber = searchParams.get("checkNumber");
  const bankFilter = searchParams.get("bankFilter");
  const customerFilter = searchParams.get("customerFilter");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // If ID is provided, return a specific check transaction
  if (id) {
    try {
      const checkTransaction = await CheckTransaction.findById(id).populate(
        "paidBy payTo"
      );
      if (!checkTransaction) {
        return NextResponse.json(
          { error: "Check transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ checkTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Build filter query
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (type && type !== "all") filter.type = type;
  if (accountId) {
    filter.$or = [{ paidBy: accountId }, { payTo: accountId }];
  }
  if (checkNumber) {
    filter.checkNumber = parseInt(checkNumber) || {
      $regex: checkNumber,
      $options: "i",
    };
  }
  if (bankFilter) {
    // We need to use aggregation to filter by populated bank name
    // For now, we'll handle this in the query by using a lookup
  }
  if (customerFilter && !accountId) {
    filter.$or = [
      { receiverName: { $regex: customerFilter, $options: "i" } },
      { senderName: { $regex: customerFilter, $options: "i" } },
    ];
  } else if (customerFilter && accountId) {
    filter.$and = [
      { $or: [{ paidBy: accountId }, { payTo: accountId }] },
      {
        $or: [
          { receiverName: { $regex: customerFilter, $options: "i" } },
          { senderName: { $regex: customerFilter, $options: "i" } },
        ],
      },
    ];
    delete filter.$or;
  }
  if (dateFrom || dateTo) {
    filter.dueDate = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      (filter.dueDate as Record<string, unknown>).$gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      (filter.dueDate as Record<string, unknown>).$lte = toDate;
    }
  }

  try {
    const skip = (page - 1) * limit;

    let checkTransactions;
    let total;

    if (bankFilter) {
      // Use aggregation pipeline for bank filtering
      const pipeline = [
        {
          $lookup: {
            from: "banks",
            localField: "toBank",
            foreignField: "_id",
            as: "toBankData",
          },
        },
        {
          $match: {
            ...filter,
            "toBankData.name": { $regex: bankFilter, $options: "i" },
          },
        },
        {
          $lookup: {
            from: "detailedaccounts",
            localField: "paidBy",
            foreignField: "_id",
            as: "paidByData",
          },
        },
        {
          $lookup: {
            from: "detailedaccounts",
            localField: "payTo",
            foreignField: "_id",
            as: "payToData",
          },
        },
        {
          $addFields: {
            toBank: { $arrayElemAt: ["$toBankData", 0] },
            paidBy: { $arrayElemAt: ["$paidByData", 0] },
            payTo: { $arrayElemAt: ["$payToData", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      checkTransactions = await CheckTransaction.aggregate(pipeline);

      // Count total for pagination
      const countPipeline = [
        {
          $lookup: {
            from: "banks",
            localField: "toBank",
            foreignField: "_id",
            as: "toBankData",
          },
        },
        {
          $match: {
            ...filter,
            "toBankData.name": { $regex: bankFilter, $options: "i" },
          },
        },
        { $count: "total" },
      ];

      const countResult = await CheckTransaction.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      checkTransactions = await CheckTransaction.find(filter)
        .populate("paidBy payTo toBank")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await CheckTransaction.countDocuments(filter);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      checkTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
// POST: Create a new check transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const checkTransaction = await CheckTransaction.create(body);

    // Create daily book entry for the check
    await createDailyBookForCheck(checkTransaction);

    return NextResponse.json({ checkTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
// PATCH: Update a check transaction
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
    const checkTransaction = await CheckTransaction.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!checkTransaction) {
      return NextResponse.json(
        { error: "Check transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ checkTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
// DELETE: Delete a check transaction
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
    const checkTransaction = await CheckTransaction.findByIdAndDelete(id);
    if (!checkTransaction) {
      return NextResponse.json(
        { error: "Check transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Check transaction deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
