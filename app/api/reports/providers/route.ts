import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    console.log('Starting provider reports aggregation...');
    const providerReports = await Inventory.aggregate([
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" },
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
      },
      { $sort: { purchaseAmount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count
    const totalCountResult = await Inventory.aggregate([
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" },
      {
        $group: {
          _id: "$providerInfo._id",
        },
      },
      { $count: "total" }
    ]);
    
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
