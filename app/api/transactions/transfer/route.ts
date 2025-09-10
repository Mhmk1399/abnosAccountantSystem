import { NextRequest, NextResponse } from "next/server";
import TransferTransaction from "@/models/transactions/transferTransaction";
import connect from "@/lib/data";
import { PipelineStage } from "mongoose";

// Define types for MongoDB query filters
interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

interface TransferTransactionFilter {
  type?: string;
  paidBy?: string;
  payTo?: string;
  transferReference?: { $regex: string; $options: string };
  transferDate?: DateFilter;
}

// GET: Retrieve transfer transactions with filtering and pagination
export const GET = async (req: NextRequest) => {
  await connect();

  // Safely handle req.url
  if (!req.url) {
    return NextResponse.json(
      { error: "Request URL is undefined" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = req.headers.get("id");
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const bankFilter = searchParams.get("bankFilter");
  const paidByFilter = searchParams.get("paidByFilter");
  const payToFilter = searchParams.get("payToFilter");
  const transferReference = searchParams.get("transferReference");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // If ID is provided, return a specific transfer transaction
  if (id) {
    try {
      const transferTransaction = await TransferTransaction.findById(id)
        .populate("ourBank")
        .populate("paidBy")
        .populate("payTo");
      if (!transferTransaction) {
        return NextResponse.json(
          { error: "Transfer transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ transferTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Build filter query
  const filter: TransferTransactionFilter = {};
  if (type && type !== "all") filter.type = type;
  if (paidByFilter) filter.paidBy = paidByFilter;
  if (payToFilter) filter.payTo = payToFilter;
  if (transferReference) {
    filter.transferReference = { $regex: transferReference, $options: "i" };
  }
  if (dateFrom || dateTo) {
    filter.transferDate = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        filter.transferDate.$gte = fromDate;
      }
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        filter.transferDate.$lte = toDate;
      }
    }
  }

  try {
    const skip = (page - 1) * limit;

    let transferTransactions;
    let total;

    if (bankFilter) {
      // Use aggregation pipeline for bank filtering
      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: "banks",
            localField: "ourBank",
            foreignField: "_id",
            as: "ourBankData",
          },
        },
        {
          $match: {
            ...filter,
            "ourBankData.name": { $regex: bankFilter, $options: "i" },
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
            ourBank: { $arrayElemAt: ["$ourBankData", 0] },
            paidBy: { $arrayElemAt: ["$paidByData", 0] },
            payTo: { $arrayElemAt: ["$payToData", 0] },
          },
        },
        { $sort: { createdAt: -1 as -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      transferTransactions = await TransferTransaction.aggregate(pipeline);

      // Count total for pagination
      const countPipeline: PipelineStage[] = [
        {
          $lookup: {
            from: "banks",
            localField: "ourBank",
            foreignField: "_id",
            as: "ourBankData",
          },
        },
        {
          $match: {
            ...filter,
            "ourBankData.name": { $regex: bankFilter, $options: "i" },
          },
        },
        { $count: "total" },
      ];

      const countResult = await TransferTransaction.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      transferTransactions = await TransferTransaction.find(filter)
        .populate("ourBank paidBy payTo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await TransferTransaction.countDocuments(filter);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      transferTransactions,
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

// POST: Create a new transfer transaction
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const transferTransaction = await TransferTransaction.create(body);
    return NextResponse.json({ transferTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a transfer transaction by ID
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
    const transferTransaction = await TransferTransaction.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );
    if (!transferTransaction) {
      return NextResponse.json(
        { error: "Transfer transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ transferTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a transfer transaction by ID
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
    const transferTransaction = await TransferTransaction.findByIdAndDelete(id);
    if (!transferTransaction) {
      return NextResponse.json(
        { error: "Transfer transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Transfer transaction deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
