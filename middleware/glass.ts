import Glass from "@/models/glass";
import FixedAccount from "@/models/accounts/fixedAccounts";
import { NextRequest, NextResponse } from "next/server";
import { createDetailed } from "@/middleware/detailed";

// Get all glasses

export async function getGlasses(req?: NextRequest) {
  try {
    let glasses;
    let pagination = undefined;

    if (req) {
      const { searchParams } = new URL(req.url);
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");

      // If pagination parameters exist, use pagination
      if (page && limit) {
        const pageNum = parseInt(page || "1");
        const limitNum = parseInt(limit || "10");
        const skip = (pageNum - 1) * limitNum;

        glasses = await Glass.find({})
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });
        const total = await Glass.countDocuments();
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
        // No pagination parameters, return all glasses
        glasses = await Glass.find({}).sort({ createdAt: -1 });
      }
    } else {
      // No request object, return all glasses
      glasses = await Glass.find({}).sort({ createdAt: -1 });
    }

    // Return array format for backward compatibility when no pagination
    if (!pagination) {
      return NextResponse.json(glasses);
    }

    return NextResponse.json({ glasses, pagination });
  } catch (error) {
    console.error("Error fetching glasses:", error);
    return NextResponse.json(
      { error: "Error fetching glasses" },
      { status: 500 }
    );
  }
}

// Create a new glass
export async function createGlass(req: NextRequest) {
  try {
    const { name, code, sellPrice, thickness } = await req.json();
    const newGlass = new Glass({ name, code, sellPrice, thickness });
    await newGlass.save();

    try {
      // Create detailed account for the glass
      const detailedAccountData = {
        name: `${name} - Account`,
        description: `Detailed account for ${name}`,
        type: "glass",
        customer: newGlass._id,
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
        // If detailed account creation fails, delete the glass
        await Glass.findByIdAndDelete(newGlass._id);
        const errorData = await detailedResponse.json();
        throw new Error(`Detailed account creation failed: ${errorData.error}`);
      }

      const detailedData = await detailedResponse.json();

      // Update glass with detailed account ID
      newGlass.detailedAcount = detailedData.detailedAccount._id;
      await newGlass.save();
      
      // Add detailed account to fixed account
      const fixedAccountId = process.env.glassFixedAccount;
      await FixedAccount.findByIdAndUpdate(
        fixedAccountId,
        {
          $push: { detailedAccounts: detailedData.detailedAccount._id },
          $inc: { howManyDetailedDoesItHave: 1 }
        }
      );
      
      return NextResponse.json(newGlass);
    } catch (detailedError) {
      // If detailed account creation fails, delete the glass
      await Glass.findByIdAndDelete(newGlass._id);
      throw detailedError;
    }
  } catch (error) {
    console.error("Error creating glass:", error);
    return NextResponse.json(
      { error: "Error creating glass" },
      { status: 500 }
    );
  }
}

// Update an existing glass
export async function updateGlass(req: NextRequest) {
  try {
    const { _id, name, code, sellPrice, thickness } = await req.json();
    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const updatedGlass = await Glass.findByIdAndUpdate(
      _id,
      { name, code, sellPrice, thickness },
      { new: true }
    );
    return NextResponse.json(updatedGlass);
  } catch (error) {
    console.error("Error updating glass:", error);
    return NextResponse.json(
      { error: "Error updating glass" },
      { status: 500 }
    );
  }
}

// Delete a glass
export async function deleteGlass(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const deletedGlass = await Glass.findByIdAndDelete(id);
    return NextResponse.json(deletedGlass);
  } catch (error) {
    console.error("Error deleting glass:", error);
    return NextResponse.json(
      { error: "Error deleting glass" },
      { status: 500 }
    );
  }
}
