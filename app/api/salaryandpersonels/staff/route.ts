import { NextRequest, NextResponse } from "next/server";
import staff from "@/models/salaryandpersonels/staff";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import { generateDetailedAccountCode } from "@/lib/codeGenerator";
import connect from "@/lib/data";

// Define types for MongoDB query filters
interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

interface StaffFilter {
  name?: { $regex: string; $options: string };
  personalNumber?: { $regex: string; $options: string };
  mobilePhone?: { $regex: string; $options: string };
  contracthireDate?: DateFilter;
}

// GET: Get all or one staff entry
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");

  if (id) {
    try {
      const staffMember = await staff.findById(id);
      if (!staffMember) {
        return NextResponse.json(
          { error: "Staff member not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ staff: staffMember });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    // Safely handle req.url
    if (!req.url) {
      return NextResponse.json(
        { error: "Request URL is undefined" },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const filterConditions: StaffFilter = {};
    const name = searchParams.get("name");
    const personalNumber = searchParams.get("personalNumber");
    const mobilePhone = searchParams.get("mobilePhone");
    const contracthireDate = searchParams.get("contracthireDate");

    if (name) filterConditions.name = { $regex: name, $options: "i" };
    if (personalNumber)
      filterConditions.personalNumber = {
        $regex: personalNumber,
        $options: "i",
      };
    if (mobilePhone)
      filterConditions.mobilePhone = { $regex: mobilePhone, $options: "i" };

    if (contracthireDate) {
      try {
        const range = JSON.parse(contracthireDate) as [
          string | undefined,
          string | undefined
        ];
        if (Array.isArray(range) && range.length === 2) {
          const [startDate, endDate] = range;
          if (startDate || endDate) {
            filterConditions.contracthireDate = {};
            if (startDate) {
              const start = new Date(startDate);
              if (!isNaN(start.getTime())) {
                filterConditions.contracthireDate.$gte = start;
              }
            }
            if (endDate) {
              const end = new Date(endDate);
              if (!isNaN(end.getTime())) {
                filterConditions.contracthireDate.$lte = end;
              }
            }
          }
        }
      } catch {
        console.log("Invalid contracthireDate filter format");
      }
    }

    const staffMembers = await staff
      .find(filterConditions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await staff.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      staff: staffMembers,
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
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a staff entry
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();

    // Create detailed account for staff
    const code = await generateDetailedAccountCode();
    const detailedAccount = await DetailedAccount.create({
      name: `${body.name} - ${body.position}`,
      description: `حساب تفصیلی پرسنل - ${body.name}`,
      code,
      type: "debit",
      fiscalType: "permanat",
    });

    // Create staff with detailed account reference
    const staffMember = await staff.create({
      ...body,
      detailedAccount: detailedAccount._id,
    });

    return NextResponse.json({ staff: staffMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a staff entry
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
    const staffMember = await staff.findByIdAndUpdate(id, body, { new: true });
    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ staff: staffMember });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a staff entry
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
    const staffMember = await staff.findByIdAndDelete(id);
    if (!staffMember) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
