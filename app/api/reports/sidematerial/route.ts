import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import SideMaterial from "@/models/sideMaterial";

export async function GET(request: NextRequest) {
  try {
    await connect();

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const sideMaterialReports = await SideMaterial.aggregate([
      {
        $lookup: {
          from: "invoices",
          let: { materialId: "$_id" },
          pipeline: [
            { $unwind: "$sideMaterials" },
            { $match: { $expr: { $eq: ["$sideMaterials.materialId", "$$materialId"] } } },
            {
              $group: {
                _id: "$$materialId",
                usageCount: { $sum: 1 },
                consumedQuantity: { $sum: "$sideMaterials.quantity" },
                lastUsedDate: { $max: "$productionDate" },
              },
            },
          ],
          as: "usage",
        },
      },
      {
        $addFields: {
          usageCount: {
            $ifNull: [{ $arrayElemAt: ["$usage.usageCount", 0] }, 0],
          },
          consumedQuantity: {
            $ifNull: [{ $arrayElemAt: ["$usage.consumedQuantity", 0] }, 0],
          },
          lastUsedDate: {
            $cond: {
              if: { $arrayElemAt: ["$usage.lastUsedDate", 0] },
              then: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $arrayElemAt: ["$usage.lastUsedDate", 0] },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          usageCount: 1,
          consumedQuantity: 1,
          lastUsedDate: 1,
          type: { $literal: "sidematerial" },
        },
      },
      { $sort: { usageCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count
    const totalCount = await SideMaterial.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      sideMaterialReports,
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
      { error: "خطا در دریافت گزارش مواد جانبی" },
      { status: 500 }
    );
  }
}
