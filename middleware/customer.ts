import Customer from "@/models/customer";
import { NextRequest, NextResponse } from "next/server";

// Get all customers
export async function getCustomers(req?: NextRequest) {
  try {
    let customers;
    let pagination = undefined;
    let query: any = {};

    if (req) {
      const { searchParams } = new URL(req.url);
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");

      // Build query object based on filters
      const nameFilter = searchParams.get("name");
      const phoneFilter = searchParams.get("phone");

      // Handle text filters - only if they have actual values
      if (nameFilter && nameFilter.trim() !== "") {
        query.name = { $regex: nameFilter.trim(), $options: "i" };
      }

      if (phoneFilter && phoneFilter.trim() !== "") {
        query.phone = { $regex: phoneFilter.trim(), $options: "i" };
      }

      // Handle date range filters (registrationDate)
      const registrationDateMin = searchParams.get("registrationDate_min");
      const registrationDateMax = searchParams.get("registrationDate_max");
      if (
        (registrationDateMin && registrationDateMin.trim() !== "") ||
        (registrationDateMax && registrationDateMax.trim() !== "")
      ) {
        query.updatedAt = {};
        if (registrationDateMin && registrationDateMin.trim() !== "") {
          query.updatedAt.$gte = new Date(registrationDateMin);
        }
        if (registrationDateMax && registrationDateMax.trim() !== "") {
          const endDate = new Date(registrationDateMax);
          endDate.setHours(23, 59, 59, 999);
          query.updatedAt.$lte = endDate;
        }
      }

      // If pagination parameters exist, use pagination
      if (page && limit) {
        const pageNum = parseInt(page || "1");
        const limitNum = parseInt(limit || "10");
        const skip = (pageNum - 1) * limitNum;

        customers = await Customer.find(query)

          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        pagination = {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        };
      } else {
        // No pagination parameters, return all customers
        customers = await Customer.find(query)
        .sort({ createdAt: -1 });
      }
    } else {
      // No request object, return all customers
      customers = await Customer.find({}).sort({ createdAt: -1 });
    }

    // Return array format for backward compatibility when no pagination
    if (!pagination) {
      return NextResponse.json(customers);
    }

    return NextResponse.json({ customers, pagination });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Error fetching customers" },
      { status: 500 }
    );
  }
}
