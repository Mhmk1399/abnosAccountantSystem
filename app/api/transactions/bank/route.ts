import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Bank from "@/models/transactions/bank";
import DetailedAccount from "@/models/accounts/detailedAcounts";
import FiscalYear from "@/models/fiscalYear";
import { generateDetailedAccountCode } from "@/lib/codeGenerator";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const bank = await Bank.findById(id).populate("detailedAccount");
      if (!bank) {
        return NextResponse.json({ error: "Bank not found" }, { status: 404 });
      }
      return NextResponse.json(bank);
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const nameFilter = searchParams.get('nameFilter');
    const branchFilter = searchParams.get('branchFilter');
    const ownerFilter = searchParams.get('ownerFilter');
    const accountNumberFilter = searchParams.get('accountNumberFilter');

    // Build filter object
    const filter: any = {};

    if (nameFilter) {
      filter.name = { $regex: nameFilter, $options: 'i' };
    }

    if (branchFilter) {
      filter.branchName = { $regex: branchFilter, $options: 'i' };
    }

    if (ownerFilter) {
      filter.ownerName = { $regex: ownerFilter, $options: 'i' };
    }

    if (accountNumberFilter) {
      filter.accountNumber = { $regex: accountNumberFilter, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalRecords = await Bank.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch banks with pagination and filtering
    const banks = await Bank.find(filter)
      .populate("detailedAccount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      banks,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const data = await request.json();

    // Get active fiscal year
    const activeFiscalYear = await FiscalYear.findOne({ isActive: true });
    if (!activeFiscalYear) {
      return NextResponse.json(
        { error: "No active fiscal year found" },
        { status: 400 }
      );
    }

    // Create bank
    const bank = new Bank(data);
    await bank.save();

    // Create detailed account for the bank
    const code = await generateDetailedAccountCode();
    const detailedAccount = await DetailedAccount.create({
      name: data.name,
      description: data.description,
      code,
      status: "active",
      fiscalType: "temparary",
      type: "credit",
      fiscalYear: activeFiscalYear._id,
    });

    // Update bank with detailed account reference
    bank.detailedAccount = detailedAccount._id;
    await bank.save();

    return NextResponse.json(bank, { status: 201 });
  } catch (error: unknown) {
    console.error("Bank creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create bank",
        details: (error && typeof error === "object" && "message" in error) ? (error as { message: string }).message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bank ID required" }, { status: 400 });
    }

    const data = await request.json();
    const bank = await Bank.findByIdAndUpdate(id, data, { new: true });

    if (!bank) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    return NextResponse.json(bank);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to update bank" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bank ID required" }, { status: 400 });
    }

    const bank = await Bank.findByIdAndDelete(id);

    if (!bank) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bank deleted successfully" });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to delete bank" },
      { status: 500 }
    );
  }
}
