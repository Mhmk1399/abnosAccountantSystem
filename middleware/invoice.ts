import Customer from "@/models/customer";
import Glass from "@/models/glass";
import Invoice from "@/models/invoice";
import Priority from "@/models/priority";
import SideMaterial from "@/models/sideMaterial";
import Design from "@/models/design";
import { NextRequest, NextResponse } from "next/server";
import { createDailyBookEntryForInvoice } from "@/services/dailyBookService";

// Get all invoices with pagination and optional filtering
export async function getInvoices(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const filterConditions: any = {};
    const customerName = searchParams.get("customer.name");
    const status = searchParams.get("status");
    const code = searchParams.get("code");
    const priceFilter = searchParams.get("price");

    if (status) filterConditions.status = status;
    if (code) filterConditions.code = { $regex: code, $options: "i" };
    
    if (priceFilter) {
      try {
        const range = JSON.parse(priceFilter);
        if (Array.isArray(range) && range.length === 2) {
          const [min, max] = range.map(Number);
          if (min > 0 || max > 0) {
            filterConditions.price = {};
            if (min > 0) filterConditions.price.$gte = min;
            if (max > 0) filterConditions.price.$lte = max;
          }
        }
      } catch (e) {
        console.log('Invalid price filter format');
      }
    }
    
    // Handle customer name filtering - need to use aggregation for populated fields
    let useAggregation = false;
    const aggregationPipeline: any[] = [];
    
    if (customerName) {
      useAggregation = true;
    }

    let invoices;
    
    if (useAggregation) {
      // Use aggregation for customer name filtering
      aggregationPipeline.push(
        { $match: filterConditions },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer"
          }
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } }
      );
      
      if (customerName) {
        aggregationPipeline.push({
          $match: {
            "customer.name": { $regex: customerName, $options: "i" }
          }
        });
      }
      
      aggregationPipeline.push(
        {
          $lookup: {
            from: "sidematerials",
            localField: "sideMaterial",
            foreignField: "_id",
            as: "sideMaterial"
          }
        },
        { $unwind: { path: "$sideMaterial", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "priorities",
            localField: "priority",
            foreignField: "_id",
            as: "priority"
          }
        },
        { $unwind: { path: "$priority", preserveNullAndEmptyArrays: true } },
        { $skip: skip },
        { $limit: limit }
      );
      
      invoices = await Invoice.aggregate(aggregationPipeline);
    } else {
      invoices = await Invoice.find(filterConditions)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "customer",
          model: Customer,
        })
        .populate({
          path: "sideMaterial",
          model: SideMaterial,
        })
        .populate({
          path: "priority",
          model: Priority,
        })
        .populate({
          path: "layers.glass",
          model: Glass,
        });
    }
    // .populate({
    //   path: "layers.treatments.treatment",
    //   model: GlassTreatment,
    // });
    // Get total count for pagination
    let totalCount;
    if (useAggregation && customerName) {
      const countPipeline = aggregationPipeline.slice(0, -2); // Remove skip and limit
      countPipeline.push({ $count: "total" });
      const countResult = await Invoice.aggregate(countPipeline);
      totalCount = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      totalCount = await Invoice.countDocuments(filterConditions);
    }
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      invoices,
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
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Failed to fetch invoices", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update an existing invoice
export async function updateInvoice(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Check if invoice exists
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    // If code is being updated, check for uniqueness
    if (updateData.code && updateData.code !== existingInvoice.code) {
      const codeExists = await Invoice.findOne({ code: updateData.code });
      if (codeExists) {
        return NextResponse.json(
          { message: "Invoice code must be unique" },
          { status: 400 }
        );
      }
    }

    // Validate layers if present in update
    if (updateData.layers && Array.isArray(updateData.layers)) {
      for (let i = 0; i < updateData.layers.length; i++) {
        const layer = updateData.layers[i];
        if (!layer.width || !layer.height) {
          return NextResponse.json(
            {
              message: `Layer ${
                i + 1
              } is missing required dimensions (width/height)`,
            },
            { status: 400 }
          );
        }
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({
        path: "customer",
        model: Customer,
      })
      .populate({
        path: "sideMaterial",
        model: SideMaterial,
      })
      .populate({
        path: "priority",
        model: Priority,
      })
      .populate({
        path: "designNumber",
        model: Design,
      })
      .populate({
        path: "layers.glass",
        model: Glass,
      });
    // .populate({
    //   path: "layers.treatment",
    //   model: GlassTreatment,
    // });

    // Create daily book entry when status changes from pending to in progress
    if (
      existingInvoice.status === "pending" &&
      updateData.status === "in progress"
    ) {
      try {
        await createDailyBookEntryForInvoice(updatedInvoice);
      } catch (error) {
        console.error("Error creating daily book entry:", error);
        // Continue with invoice update even if daily book entry fails
      }
    }

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { message: "Failed to update invoice", error: (error as Error).message },
      { status: 500 }
    );
  }
}
