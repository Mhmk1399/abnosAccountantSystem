import { NextResponse, NextRequest } from "next/server";
import GroupDetailAccount from "@/models/accounts/groupDetailAccount";
import connect from "@/lib/data";

// GET: Get all or one group detail account
export const GET = async (req: NextRequest) => {
  await connect();

  const id = req.headers.get("id");
  const { searchParams } = new URL(req.url);

  if (id) {
    try {
      const groupDetailAccount = await GroupDetailAccount.findById(id).populate(
        "detailedAccounts"
      );
      if (!groupDetailAccount) {
        return NextResponse.json(
          { error: "Group detail account not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ groupDetailAccount });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  try {
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const filter: Record<
      string,
      { $regex: string; $options: string } | string
    > = {};

    const nameParam = searchParams.get("name");
    if (nameParam) {
      filter.name = { $regex: nameParam, $options: "i" };
    }

    const flagParam = searchParams.get("flag");
    if (flagParam) {
      filter.flag = { $regex: flagParam, $options: "i" };
    }

    const query = GroupDetailAccount.find(filter).populate("detailedAccounts");

    // Filter by detailed account name if provided
    const detailAccountName = searchParams.get("detailedAccounts");
    if (detailAccountName) {
      const allResults = await GroupDetailAccount.find(filter)
        .populate({
          path: "detailedAccounts",
          match: { name: { $regex: detailAccountName, $options: "i" } },
        })
        .sort({ createdAt: -1 });

      const filteredResults = allResults.filter(
        (item) => item.detailedAccounts && item.detailedAccounts.length > 0
      );

      const total = filteredResults.length;
      const paginatedResults = filteredResults.slice(skip, skip + limit);

      return NextResponse.json({
        groupDetailAccounts: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      });
    }

    const total = await GroupDetailAccount.countDocuments(filter);
    const groupDetailAccounts = await query
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      groupDetailAccounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
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

// POST: Create a group detail account
export const POST = async (req: NextRequest) => {
  await connect();

  try {
    const body = await req.json();
    const groupDetailAccount = await GroupDetailAccount.create(body);
    return NextResponse.json({ groupDetailAccount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// PATCH: Update a group detail account
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
    const groupDetailAccount = await GroupDetailAccount.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );
    if (!groupDetailAccount) {
      return NextResponse.json(
        { error: "Group detail account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ groupDetailAccount });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a group detail account
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
    const groupDetailAccount = await GroupDetailAccount.findByIdAndDelete(id);
    if (!groupDetailAccount) {
      return NextResponse.json(
        { error: "Group detail account not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Group detail account deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
