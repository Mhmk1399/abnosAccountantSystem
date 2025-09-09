import Provider from "@/models/provider";
import FixedAccount from "@/models/accounts/fixedAccounts";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";
import { createDetailed } from "@/middleware/detailed";

// Get all providers
export async function getProviders(req?: NextRequest) {
  try {
    // Get pagination and filter parameters
    const { searchParams } = req
      ? new URL(req.url)
      : { searchParams: new URLSearchParams() };
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Filter parameters
    const name = searchParams.get("name");
    const code = searchParams.get("code");
    const createdAtFrom = searchParams.get("createdAtFrom");
    const createdAtTo = searchParams.get("createdAtTo");

    // Build filter object
    const filter: any = {};

    // Name filter (case-insensitive partial match)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Code filter (case-insensitive partial match)
    if (code) {
      filter.code = { $regex: code, $options: "i" };
    }

    // Created date range filter
    if (createdAtFrom || createdAtTo) {
      filter.createdAt = {};
      if (createdAtFrom) {
        const fromDate = new Date(createdAtFrom);
        fromDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = fromDate;
      }
      if (createdAtTo) {
        const toDate = new Date(createdAtTo);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const providers = await Provider.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination with filters
    const totalCount = await Provider.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      providers,
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
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Error fetching providers" },
      { status: 500 }
    );
  }
}

// Create a new provider
export async function createProvider(req: NextRequest) {
  try {
    const { name, info } = await req.json();
    const code = await generateSequentialCode("Provider", "");

    const newProvider = new Provider({ name, code, info });
    await newProvider.save();

    try {
      // Create detailed account for the provider
      const detailedAccountData = {
        name: `${name} - Account`,
        description: `Detailed account for ${name}`,
        type: "debit",
        provider: newProvider._id,
      };

      const detailedAccountReq = new Request(
        "http://localhost:3000/api/detailed",
        {
          method: "POST",
          body: JSON.stringify(detailedAccountData),
        }
      );

      const detailedResponse = await createDetailed(detailedAccountReq);

      if (!detailedResponse.ok) {
        // If detailed account creation fails, delete the provider
        await Provider.findByIdAndDelete(newProvider._id);
        const errorData = await detailedResponse.json();
        throw new Error(`Detailed account creation failed: ${errorData.error}`);
      }

      const detailedData = await detailedResponse.json();

      // Update provider with detailed account ID
      newProvider.detailedAcount = detailedData.detailedAccount._id;
      await newProvider.save();

      // Add detailed account to fixed account
      const fixedAccountId = process.env.providerFixedAccount;
      await FixedAccount.findByIdAndUpdate(fixedAccountId, {
        $push: { detailedAccounts: detailedData.detailedAccount._id },
        $inc: { howManyDetailedDoesItHave: 1 },
      });

      return NextResponse.json(newProvider);
    } catch (detailedError) {
      // If detailed account creation fails, delete the provider
      await Provider.findByIdAndDelete(newProvider._id);
      throw detailedError;
    }
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Error creating provider" },
      { status: 500 }
    );
  }
}
// Update an existing provider
export async function updateProvider(req: NextRequest) {
  try {
    const { _id, name, code, info } = await req.json();
    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const updatedProvider = await Provider.findByIdAndUpdate(
      _id,
      { name, code, info },
      { new: true }
    );
    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Error updating provider" },
      { status: 500 }
    );
  }
}

// Delete a provider
export async function deleteProvider(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const deletedProvider = await Provider.findByIdAndDelete(id);
    return NextResponse.json(deletedProvider);
  } catch (error) {
    console.error("Error deleting provider:", error);
    return NextResponse.json(
      { error: "Error deleting provider" },
      { status: 500 }
    );
  }
}
