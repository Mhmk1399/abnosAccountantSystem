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
    const code = searchParams.get("code");
    const name = searchParams.get("name");
    const purchaseAmountFrom = searchParams.get("purchaseAmountFrom");
    const purchaseAmountTo = searchParams.get("purchaseAmountTo");

    // Build match stage for filters
    const matchStage: any = {};
    if (code) {
      matchStage["providerInfo.code"] = { $regex: code, $options: "i" };
    }
    if (name) {
      matchStage["providerInfo.name"] = { $regex: name, $options: "i" };
    }

    console.log("Starting provider reports aggregation...");
    const pipeline: any[] = [
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" },
    ];

    // Add match stage if filters exist
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

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
          remainingAmount: { $subtract: ["$purchaseAmount", "$usedAmount"] },
        },
      }
    );

    // Add purchase amount range filter after grouping
    if (purchaseAmountFrom || purchaseAmountTo) {
      const purchaseAmountMatch: any = {};
      if (purchaseAmountFrom) {
        purchaseAmountMatch.purchaseAmount = {
          $gte: parseFloat(purchaseAmountFrom),
        };
      }
      if (purchaseAmountTo) {
        if (purchaseAmountMatch.purchaseAmount) {
          purchaseAmountMatch.purchaseAmount.$lte =
            parseFloat(purchaseAmountTo);
        } else {
          purchaseAmountMatch.purchaseAmount = {
            $lte: parseFloat(purchaseAmountTo),
          };
        }
      }
      pipeline.push({ $match: purchaseAmountMatch });
    }

    pipeline.push(
      { $sort: { purchaseAmount: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const providerReports = await Inventory.aggregate(pipeline);

    // Get total count with same filters
    const countPipeline: any[] = [
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" },
    ];

    if (Object.keys(matchStage).length > 0) {
      countPipeline.push({ $match: matchStage });
    }

    countPipeline.push({
      $group: {
        _id: "$providerInfo._id",
        purchaseAmount: { $sum: { $multiply: ["$count", "$buyPrice"] } },
      },
    });

    if (purchaseAmountFrom || purchaseAmountTo) {
      const purchaseAmountMatch: any = {};
      if (purchaseAmountFrom) {
        purchaseAmountMatch.purchaseAmount = {
          $gte: parseFloat(purchaseAmountFrom),
        };
      }
      if (purchaseAmountTo) {
        if (purchaseAmountMatch.purchaseAmount) {
          purchaseAmountMatch.purchaseAmount.$lte =
            parseFloat(purchaseAmountTo);
        } else {
          purchaseAmountMatch.purchaseAmount = {
            $lte: parseFloat(purchaseAmountTo),
          };
        }
      }
      countPipeline.push({ $match: purchaseAmountMatch });
    }

    countPipeline.push({ $count: "total" });

    const totalCountResult = await Inventory.aggregate(countPipeline);

    const totalCount = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log("Provider reports result:", {
      count: providerReports.length,
      totalCount,
    });

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
