import { NextResponse } from "next/server";
import Inventory from "@/models/inevntory";
import { NextRequest } from "next/server";
import Provider from "@/models/provider";
import Glass from "@/models/glass";
import SideMaterial from "@/models/sideMaterial";
import { generateSequentialCode } from "@/utils/codeGenerator";

// Create inventory middleware
export async function createInventory(req: NextRequest) {
  try {
    const {
      name,
      buyPrice,
      provider,
      glass,
      sideMaterial,
      amount,
      enterDate,
      count,
      width,
      height,
    } = await req.json();
    const code = await generateSequentialCode("Inventory", "");

    const inventory = await Inventory.create({
      name,
      code,
      buyPrice,
      provider,
      glass,
      sideMaterial,
      amount,
      enterDate,
      count,
      width,
      height,
    });
    await inventory.save();

    return NextResponse.json({ message: "Inventory created" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Get all inventory middleware
export async function getAllInventory(req?: NextRequest) {
  try {
    // Get pagination parameters
    const { searchParams } = req ? new URL(req.url) : { searchParams: new URLSearchParams() };
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const inventory = await Inventory.find()
      .populate({
        path: "provider",
        model: Provider,
        select: "name code info",
      })
      .populate({
        path: "glass",
        model: Glass,
        select: "name code width height thickness sellPrice",
      })
      .populate({
        path: "sideMaterial",
        model: SideMaterial,
        select: "name code ServiceFee",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Inventory.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      inventory,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in getAllInventory:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Update inventory middleware
export async function updateInventory(req: NextRequest) {
  try {
    const {
      id,
      name,
      buyPrice,
      provider,
      glass,
      sideMaterial,
      amount,
      enterDate,
      count,
      width,
      height,
    } = await req.json();
    const code = await generateSequentialCode("Inventory", "");

    const inventory = await Inventory.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          code,
          buyPrice,
          provider,
          glass,
          sideMaterial,
          amount,
          enterDate,
          count,
          width,
          height,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Inventory updated", inventory },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Delete inventory middleware
export async function deleteInventory(req: NextRequest) {
  try {
    const { id } = await req.json();

    await Inventory.findByIdAndDelete(id);
    return NextResponse.json({ message: "Inventory deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
