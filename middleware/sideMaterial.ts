import SideMaterial from "@/models/sideMaterial";
import FixedAccount from "@/models/accounts/fixedAccounts";
import { generateSequentialCode } from "@/utils/codeGenerator";
import { NextRequest, NextResponse } from "next/server";
import { createDetailed } from "@/middleware/detailed";

// Get all side materials
export async function getSideMaterials(req?: NextRequest) {
  try {
    let sideMaterials;
    let pagination = undefined;

    if (req) {
      const { searchParams } = new URL(req.url);
      const page = searchParams.get('page');
      const limit = searchParams.get('limit');
      
      // If pagination parameters exist, use pagination
      if (page || limit) {
        const pageNum = parseInt(page || '1');
        const limitNum = parseInt(limit || '10');
        const skip = (pageNum - 1) * limitNum;

        sideMaterials = await SideMaterial.find({}).skip(skip).limit(limitNum).sort({ createdAt: -1 });
        const total = await SideMaterial.countDocuments();
        const totalPages = Math.ceil(total / limitNum);

        pagination = {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        };
      } else {
        // No pagination parameters, return all side materials
        sideMaterials = await SideMaterial.find({}).sort({ createdAt: -1 });
      }
    } else {
      // No request object, return all side materials
      sideMaterials = await SideMaterial.find({}).sort({ createdAt: -1 });
    }

    // Return array format for backward compatibility when no pagination
    if (!pagination) {
      return NextResponse.json(sideMaterials);
    }
    
    return NextResponse.json({ sideMaterials, pagination });
  } catch (error) {
    console.error("Error fetching side materials:", error);
    return NextResponse.json(
      { error: "Error fetching side materials" },
      { status: 500 }
    );
  }
}

// Create a new side material
export async function createSideMaterial(req: NextRequest) {
  try {
    const { name, serviceFeeType, serviceFeeValue } = await req.json();
    const code = await generateSequentialCode("SideMaterial", "");

    const newSideMaterial = new SideMaterial({
      name,
      code,
      ServiceFee: {
        serviceFeeType,
        serviceFeeValue,
      },
    });

    await newSideMaterial.save();
    
    try {
      // Create detailed account for the side material
      const detailedAccountData = {
        name: `${name} - Account`,
        description: `Detailed account for ${name}`,
        type: "sideMaterial",
        customer: newSideMaterial._id
      };
      
      const detailedAccountReq = new Request('http://localhost:3000/api/detailed', {
        method: 'POST',
        body: JSON.stringify(detailedAccountData)
      });
      
      const detailedResponse = await createDetailed(detailedAccountReq);
      
      if (!detailedResponse.ok) {
        // If detailed account creation fails, delete the side material
        await SideMaterial.findByIdAndDelete(newSideMaterial._id);
        const errorData = await detailedResponse.json();
        throw new Error(`Detailed account creation failed: ${errorData.error}`);
      }
      
      const detailedData = await detailedResponse.json();
      
      // Update side material with detailed account ID
      newSideMaterial.detailedAcount = detailedData.detailedAccount._id;
      await newSideMaterial.save();
      
      // Add detailed account to fixed account
      const fixedAccountId = process.env.sideMaterialsFixedAccount;
      await FixedAccount.findByIdAndUpdate(
        fixedAccountId,
        {
          $push: { detailedAccounts: detailedData.detailedAccount._id },
          $inc: { howManyDetailedDoesItHave: 1 }
        }
      );
      
      return NextResponse.json(newSideMaterial);
    } catch (detailedError) {
      // If detailed account creation fails, delete the side material
      await SideMaterial.findByIdAndDelete(newSideMaterial._id);
      throw detailedError;
    }
  } catch (error) {
    console.error("Error creating side material:", error);
    return NextResponse.json(
      { error: "Error creating side material" },
      { status: 500 }
    );
  }
}

// Update an existing side material
export async function updateSideMaterial(req: NextRequest) {
  try {
    const { _id, name, code, serviceFeeType, serviceFeeValue } =
      await req.json();

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedSideMaterial = await SideMaterial.findByIdAndUpdate(
      _id,
      {
        name,
        code,
        ServiceFee: {
          serviceFeeType,
          serviceFeeValue,
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedSideMaterial);
  } catch (error) {
    console.error("Error updating side material:", error);
    return NextResponse.json(
      { error: "Error updating side material" },
      { status: 500 }
    );
  }
}

// Delete a side material
export async function deleteSideMaterial(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const deletedSideMaterial = await SideMaterial.findByIdAndDelete(id);
    return NextResponse.json(deletedSideMaterial);
  } catch (error) {
    console.error("Error deleting side material:", error);
    return NextResponse.json(
      { error: "Error deleting side material" },
      { status: 500 }
    );
  }
}
