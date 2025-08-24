import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const inventoryReports = await Inventory.aggregate([
      {
        $lookup: {
          from: "providers",
          localField: "provider",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      {
        $lookup: {
          from: "glasses",
          localField: "glass",
          foreignField: "_id",
          as: "glassInfo",
        },
      },
      {
        $lookup: {
          from: "sidematerials",
          localField: "sideMaterial",
          foreignField: "_id",
          as: "sideMaterialInfo",
        },
      },
      {
        $addFields: {
          usageCount: { $ifNull: ["$usedCount", 0] },
          lastUsedDate: null,
          remainingStock: { $subtract: ["$count", { $ifNull: ["$usedCount", 0] }] }
        }
      },
      {
        $addFields: {
          itemName: {
            $cond: {
              if: { $gt: [{ $size: "$glassInfo" }, 0] },
              then: { $arrayElemAt: ["$glassInfo.name", 0] },
              else: { $arrayElemAt: ["$sideMaterialInfo.name", 0] },
            },
          },
          itemCode: {
            $cond: {
              if: { $gt: [{ $size: "$glassInfo" }, 0] },
              then: { $arrayElemAt: ["$glassInfo.code", 0] },
              else: { $arrayElemAt: ["$sideMaterialInfo.code", 0] },
            },
          },
          totalArea: {
            $cond: {
              if: { $and: ["$width", "$height"] },
              then: { $divide: [{ $multiply: ["$width", "$height"] }, 10000] },
              else: 0,
            },
          },

          type: {
            $cond: {
              if: { $gt: [{ $size: "$glassInfo" }, 0] },
              then: "glass",
              else: "sidematerial",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: "$itemName",
          code: "$itemCode",
          buyPrice: 1,
          count: 1,
          totalArea: 1,
          usageCount: 1,
          remainingStock: 1,
          enterDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$enterDate",
            },
          },
          lastUsedDate: {
            $cond: {
              if: "$lastUsedDate",
              then: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$lastUsedDate",
                },
              },
              else: null,
            },
          },
          type: { $literal: "inventory" },
        },
      },
      { $sort: { enterDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count
    const totalCount = await Inventory.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      inventoryReports,
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
    console.error(error);
    return NextResponse.json(
      { error: "خطا در دریافت گزارش موجودی" },
      { status: 500 }
    );
  }
}
