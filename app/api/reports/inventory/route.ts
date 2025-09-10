import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";
import { PipelineStage } from "mongoose";

// Define types for MongoDB query filters
interface NumberFilter {
  $gte?: number;
  $lte?: number;
}

interface MatchConditions {
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  buyPrice?: NumberFilter;
  totalArea?: NumberFilter;
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Get filter parameters
    const nameFilter = searchParams.get("name");
    const buyPriceFilter = searchParams.get("buyPrice");
    const totalAreaFilter = searchParams.get("totalArea");

    // Build match conditions
    const matchConditions: MatchConditions = {};

    if (nameFilter) {
      matchConditions.$or = [
        { "glassInfo.name": { $regex: nameFilter, $options: "i" } },
        { "sideMaterialInfo.name": { $regex: nameFilter, $options: "i" } },
      ];
    }

    if (buyPriceFilter) {
      try {
        const range = JSON.parse(buyPriceFilter);
        if (Array.isArray(range) && range.length === 2) {
          const [min, max] = range.map(Number);
          if ((min > 0 || max > 0) && !isNaN(min) && !isNaN(max)) {
            matchConditions.buyPrice = {};
            if (min > 0) matchConditions.buyPrice.$gte = min;
            if (max > 0) matchConditions.buyPrice.$lte = max;
          }
        }
      } catch {
        console.log("Invalid buyPrice filter format");
      }
    }

    const pipeline: PipelineStage[] = [
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
    ];

    // Add match stage for filters
    if (Object.keys(matchConditions).length > 0) {
      pipeline.splice(3, 0, { $match: matchConditions } as PipelineStage);
    }

    pipeline.push(
      {
        $addFields: {
          usageCount: { $ifNull: ["$usedCount", 0] },
          lastUsedDate: null,
          remainingStock: {
            $subtract: ["$count", { $ifNull: ["$usedCount", 0] }],
          },
        },
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
      { $sort: { enterDate: -1 } }
    );

    // Add totalArea filter after projection
    if (totalAreaFilter) {
      try {
        const range = JSON.parse(totalAreaFilter);
        if (Array.isArray(range) && range.length === 2) {
          const [min, max] = range.map(Number);
          if ((min > 0 || max > 0) && !isNaN(min) && !isNaN(max)) {
            const areaMatch: NumberFilter = {};
            if (min > 0) areaMatch.$gte = min;
            if (max > 0) areaMatch.$lte = max;
            pipeline.push({
              $match: { totalArea: areaMatch },
            } as PipelineStage);
          }
        }
      } catch {
        console.log("Invalid totalArea filter format");
      }
    }

    pipeline.push(
      { $sort: { enterDate: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const inventoryReports = await Inventory.aggregate(pipeline);

    // Get total count with filters
    const countPipeline = pipeline.slice(0, -3); // Remove sort, skip, limit
    const countResult = await Inventory.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
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
