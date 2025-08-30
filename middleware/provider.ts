import Provider from "@/models/provider";
import FixedAccount from "@/models/accounts/fixedAccounts";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";
import { createDetailed } from "@/middleware/detailed";

// Get all providers with filters and pagination
export async function getProviders(req?: NextRequest) {
  try {
    // Get pagination and filter parameters
    const { searchParams } = req ? new URL(req.url) : { searchParams: new URLSearchParams() };
    
    // Build filter query
    const filter: any = {};
    
    // Handle name filter
    const name = searchParams.get('name');
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    // Handle code filter
    const code = searchParams.get('code');
    if (code) {
      filter.code = { $regex: code, $options: 'i' };
    }
    
    // Handle date range filters for createdAt
    const createdAtFrom = searchParams.get('createdAt_from');
    const createdAtTo = searchParams.get('createdAt_to');
    if (createdAtFrom || createdAtTo) {
      filter.createdAt = {};
      if (createdAtFrom) filter.createdAt.$gte = new Date(createdAtFrom);
      if (createdAtTo) filter.createdAt.$lte = new Date(createdAtTo);
    }
    
    // Pagination - with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    const providers = await Provider.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
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
        provider: newProvider._id
      };
      
      const detailedAccountReq = new Request('http://localhost:3000/api/detailed', {
        method: 'POST',
        body: JSON.stringify(detailedAccountData)
      });
      
      const detailedResponse = await  createDetailed(detailedAccountReq);
      
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
      await FixedAccount.findByIdAndUpdate(
        fixedAccountId,
        {
          $push: { detailedAccounts: detailedData.detailedAccount._id },
          $inc: { howManyDetailedDoesItHave: 1 }
        }
      );
      
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
