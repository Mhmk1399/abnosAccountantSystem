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
    const { searchParams } = req
      ? new URL(req.url)
      : { searchParams: new URLSearchParams() };
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, any> = {};

    const nameParam = searchParams.get("name");
    if (nameParam) {
      filter.name = { $regex: nameParam, $options: "i" };
    }

    const buyPriceParam = searchParams.get("buyPrice");
    if (buyPriceParam) {
      console.log("buyPrice param:", buyPriceParam);
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(buyPriceParam);
        if (Array.isArray(parsed) && parsed.length === 2) {
          const [minPrice, maxPrice] = parsed;
          if (minPrice > 0 || maxPrice > 0) {
            filter.buyPrice = {};
            if (minPrice > 0) filter.buyPrice.$gte = minPrice;
            if (maxPrice > 0) filter.buyPrice.$lte = maxPrice;
          }
        }
      } catch (e) {
        // If not JSON, try as single number
        const price = parseFloat(buyPriceParam);
        if (!isNaN(price)) {
          filter.buyPrice = price;
        }
      }
    }

    const enterDateParam = searchParams.get("enterDate");
    if (enterDateParam) {
      console.log("enterDate param:", enterDateParam);
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(enterDateParam);
        if (Array.isArray(parsed) && parsed.length === 2) {
          const [fromDate, toDate] = parsed;
          if (fromDate || toDate) {
            filter.enterDate = {};
            if (fromDate) {
              filter.enterDate.$gte = new Date(fromDate);
            }
            if (toDate) {
              const endDate = new Date(toDate);
              endDate.setHours(23, 59, 59, 999);
              filter.enterDate.$lte = endDate;
            }
          }
        }
      } catch (e) {
        // If not JSON, try as single date
        const date = new Date(enterDateParam);
        if (!isNaN(date.getTime())) {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          filter.enterDate = { $gte: date, $lt: nextDay };
        }
      }
    }

    // Handle material type filter
    const materialTypeParam = searchParams.get("materialType");
    if (materialTypeParam) {
      if (materialTypeParam === "شیشه") {
        filter.glass = { $exists: true, $ne: null };
        filter.sideMaterial = { $exists: false };
      } else if (materialTypeParam === "مواد جانبی") {
        filter.sideMaterial = { $exists: true, $ne: null };
        filter.glass = { $exists: false };
      }
    }

    let query = Inventory.find(filter)
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
      });

    // Handle provider filter
    const providerParam = searchParams.get("provider.name");
    if (providerParam) {
      const allResults = await query.sort({ createdAt: -1 }).lean();
      const filteredResults = allResults.filter(
        (item) =>
          item.provider &&
          typeof item.provider === "object" &&
          "name" in item.provider &&
          (item.provider as any).name
            .toLowerCase()
            .includes(providerParam.toLowerCase())
      );

      const total = filteredResults.length;
      const paginatedResults = filteredResults.slice(skip, skip + limit);

      return NextResponse.json(
        {
          inventory: paginatedResults,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
        { status: 200 }
      );
    }

    const inventory = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Inventory.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        inventory,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
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
