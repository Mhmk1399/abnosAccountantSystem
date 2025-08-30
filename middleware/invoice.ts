import Customer from "@/models/customer";
import Glass from "@/models/glass";
import GlassTreatment from "@/models/glassTreatment";
import Invoice from "@/models/invoice";
import Priority from "@/models/priority";
import SideMaterial from "@/models/sideMaterial";
import Design from "@/models/design";
import { NextRequest, NextResponse } from "next/server";
import { findFixedAccountByDetailedId } from "@/services/accountService";
import { createDailyBookEntryForInvoice } from "@/services/dailyBookService";

// Get all invoices with pagination and optional filtering
export async function getInvoices(req?: NextRequest) {
  try {
    let filter: any = {};
    let page = 1;
    let limit = 10;

    if (req) {
      const { searchParams } = new URL(req.url);
      
      // Handle code filter
      const code = searchParams.get('code');
      if (code) {
        filter.code = { $regex: code, $options: 'i' };
      }
      
      // Handle customer filter (search by name)
      const customer = searchParams.get('customer');
      if (customer) {
        const matchingCustomers = await Customer.find({
          name: { $regex: customer, $options: 'i' }
        }).select('_id');
        
        if (matchingCustomers.length > 0) {
          filter.customer = { $in: matchingCustomers.map(c => c._id) };
        } else {
          filter.customer = null;
        }
      }
      
      // Handle status filter
      const status = searchParams.get('status');
      if (status) {
        filter.status = status;
      }
      
      // Handle production date range filters
      const productionDateFrom = searchParams.get('productionDate_from');
      const productionDateTo = searchParams.get('productionDate_to');
      if (productionDateFrom || productionDateTo) {
        filter.productionDate = {};
        if (productionDateFrom) filter.productionDate.$gte = new Date(productionDateFrom);
        if (productionDateTo) filter.productionDate.$lte = new Date(productionDateTo);
      }
      
      // Pagination
      page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    }

    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalItems = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const invoices = await Invoice.find(filter)
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
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Build pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return NextResponse.json({ 
      invoices,
      pagination 
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
      })
      // .populate({
      //   path: "layers.treatment",
      //   model: GlassTreatment,
      // });

    // Create daily book entry when status changes from pending to in progress
    if (existingInvoice.status === "pending" && updateData.status === "in progress") {
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
