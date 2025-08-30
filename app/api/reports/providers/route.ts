import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get pagination and filter parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const name = searchParams.get("name");
    const code = searchParams.get("code");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");

    // Build match conditions for provider filtering
    const providerMatchConditions: Record<string, { $regex: string; $options: string }> = {};
    if (name) {
      providerMatchConditions["providerInfo.name"] = { $regex: name, $options: "i" };
    }
    if (code) {
      providerMatchConditions["providerInfo.code"] = { $regex: code, $options: "i" };
    }

    console.log('Starting provider reports aggregation...');
    
    // Build aggregation pipeline
    const pipeline: Record<string, unknown>[] = [
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" }
    ];

    // Add provider filtering if conditions exist
    if (Object.keys(providerMatchConditions).length > 0) {
      pipeline.push({ $match: providerMatchConditions });
    }

    // Add grouping and calculations
    pipeline.push(
      {
        $group: {
          _id: "$providerInfo._id",
          code: { $first: "$providerInfo.code" },
          name: { $first: "$providerInfo.name" },
          purchaseAmount: { $sum: { $multiply: ["$count", "$buyPrice"] } },
          usedAmount: { $sum: 0 },
          totalItems: { $sum: "$count" },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: "$buyPrice" },
          lastPurchaseDate: { $max: "$enterDate" },
        },
      },
      {
        $addFields: {
          remainingAmount: { $subtract: ["$purchaseAmount", "$usedAmount"] }
        }
      }
    );

    // Add amount filtering after grouping
    const amountMatchConditions: Record<string, { $gte?: number; $lte?: number }> = {};
    if (minAmount) {
      amountMatchConditions.purchaseAmount = { $gte: parseFloat(minAmount) };
    }
    if (maxAmount) {
      if (amountMatchConditions.purchaseAmount) {
        amountMatchConditions.purchaseAmount.$lte = parseFloat(maxAmount);
      } else {
        amountMatchConditions.purchaseAmount = { $lte: parseFloat(maxAmount) };
      }
    }
    if (Object.keys(amountMatchConditions).length > 0) {
      pipeline.push({ $match: amountMatchConditions });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { purchaseAmount: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const providerReports = await Inventory.aggregate(pipeline as any);

    // Get total count with same filters
    const countPipeline: Record<string, unknown>[] = [
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" }
    ];

    // Add provider filtering for count
    if (Object.keys(providerMatchConditions).length > 0) {
      countPipeline.push({ $match: providerMatchConditions });
    }

    // Add grouping for count
    countPipeline.push({
      $group: {
        _id: "$providerInfo._id",
        purchaseAmount: { $sum: { $multiply: ["$count", "$buyPrice"] } },
      },
    });

    // Add amount filtering for count
    if (Object.keys(amountMatchConditions).length > 0) {
      countPipeline.push({ $match: amountMatchConditions });
    }

    countPipeline.push({ $count: "total" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalCountResult = await Inventory.aggregate(countPipeline as any);
    
    const totalCount = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log('Provider reports result:', { count: providerReports.length, totalCount });

    return NextResponse.json({
      providerReports,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching provider report:", error);
    return NextResponse.json(
      { error: "خطا در دریافت گزارش تامین‌کنندگان" },
      { status: 500 }
    );
  }
}
