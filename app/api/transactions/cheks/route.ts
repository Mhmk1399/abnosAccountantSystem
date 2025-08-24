import { NextResponse, NextRequest } from "next/server";
import CheckTransaction from "@/models/transactions/checkTransaction";
import Inbox from "@/models/transactions/inbox";
import connect from "@/lib/data";

// GET: Retrieve check transactions with filtering
export const GET = async (req: NextRequest) => {
  await connect();

  const { searchParams } = new URL(req.url);
  const id = req.headers.get("id");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const accountId = searchParams.get("accountId");

  // If ID is provided, return a specific check transaction
  if (id) {
    try {
      const checkTransaction = await CheckTransaction.findById(id).populate(
        "paidBy payTo"
      );
      if (!checkTransaction) {
        return NextResponse.json(
          { error: "Check transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ checkTransaction });
    } catch (error) {
      return NextResponse.json(
        { error: "An error occurred: " + error },
        { status: 500 }
      );
    }
  }

  // Build filter query
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (type && type !== "all") filter.type = type;
  if (accountId) {
    filter.$or = [{ paidBy: accountId }, { payTo: accountId }];
  }
  if (dateFrom || dateTo) {
    filter.dueDate = {};
    if (dateFrom) (filter.dueDate as Record<string, unknown>).$gte = new Date(dateFrom);
    if (dateTo) (filter.dueDate as Record<string, unknown>).$lte = new Date(dateTo);
  }

  try {
    const checkTransactions = await CheckTransaction.find(filter)
      .populate("paidBy payTo toBank")
      .sort({ createdAt: -1 });
    return NextResponse.json({ checkTransactions });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new check transaction and update inbox
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const checkTransaction = await CheckTransaction.create(body);

    // Update inbox based on check type and status
    if (body.type === "income" && body.status === "nazeSandogh") {
      await updateInbox(
        body.payTo,
        checkTransaction._id,
        body.inboxStatus || "darJaryanVosool",
        "add",
        body.amount
      );
    }

    return NextResponse.json({ checkTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// Helper function to update inbox
const updateInbox = async (
  ownerId: string,
  checkId: string,
  status: string,
  action: "add" | "remove" | "move",
  checkAmount?: number
) => {
  try {
    let inbox = await Inbox.findOne({ owner: ownerId });

    if (!inbox) {
      inbox = await Inbox.create({
        owner: ownerId,
        balance: 0,
        checkStatuses: {
          nazeSandogh: [],
          darJaryanVosool: [],
          vosoolShode: [],
          bargashti: [],
          enteghalDadeShode: [],
        },
      });
    }

    if (action === "add") {
      if (!inbox.checkStatuses.get(status)) {
        inbox.checkStatuses.set(status, []);
      }
      inbox.checkStatuses.get(status).push(checkId);

// Update balance for nazeSandogh status
      if (status === "nazeSandogh" && checkAmount) {
        inbox.balance += checkAmount;
      }
    } else if (action === "remove") {
      // Remove from all status arrays and update balance
      [
        "nazeSandogh",
        "darJaryanVosool",
        "vosoolShode",
        "bargashti",
        "enteghalDadeShode",
      ].forEach((s) => {
        const arr = inbox.checkStatuses.get(s) || [];
        const index = arr.indexOf(checkId);
        if (index > -1) {
          arr.splice(index, 1);
          // Subtract from balance if removing from nazeSandogh
          if (s === "nazeSandogh" && checkAmount) {
            inbox.balance -= checkAmount;
          }
        }
      });
    }

    inbox.lastUpdated = new Date();
    await inbox.save();
  } catch (error) {
    console.error("Error updating inbox:", error);
  }
};

// PATCH: Update a check transaction and manage inbox status
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
    const oldCheck = await CheckTransaction.findById(id);

    if (!oldCheck) {
      return NextResponse.json(
        { error: "Check transaction not found" },
        { status: 404 }
      );
    }

    const checkTransaction = await CheckTransaction.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
      }
    );

    // Update inbox if status changed and it's an income check
    if (
      body.status &&
      body.status !== oldCheck.status &&
      oldCheck.type === "income"
    ) {
      // Remove from old status if it was nazeSandogh
      if (oldCheck.status === "nazeSandogh") {
        await updateInbox(
          oldCheck.payTo,
          id,
          oldCheck.inboxStatus || "darJaryanVosool",
          "remove",
          oldCheck.amount
        );
      }
      // Add to new status if it's nazeSandogh
      if (body.status === "nazeSandogh") {
        await updateInbox(
          oldCheck.payTo,
          id,
          body.inboxStatus || "darJaryanVosool",
          "add",
          oldCheck.amount
        );
      }
    }

    // Update inbox if inboxStatus changed and status is nazeSandogh
    if (
      body.inboxStatus &&
      body.inboxStatus !== oldCheck.inboxStatus &&
      oldCheck.status === "nazeSandogh" &&
      oldCheck.type === "income"
    ) {
      await updateInbox(
        oldCheck.payTo,
        id,
        oldCheck.inboxStatus || "darJaryanVosool",
        "remove",
        oldCheck.amount
      );
      await updateInbox(
        oldCheck.payTo,
        id,
        body.inboxStatus,
        "add",
        oldCheck.amount
      );
    }

    return NextResponse.json({ checkTransaction });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// DELETE: Delete a check transaction and update inbox
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
    const checkTransaction = await CheckTransaction.findById(id);
    if (!checkTransaction) {
      return NextResponse.json(
        { error: "Check transaction not found" },
        { status: 404 }
      );
    }

    // Remove from inbox if it's an income check with nazeSandogh status
    if (
      checkTransaction.type === "income" &&
      checkTransaction.status === "nazeSandogh"
    ) {
      await updateInbox(
        checkTransaction.payTo,
        id,
        checkTransaction.inboxStatus || "darJaryanVosool",
        "remove",
        checkTransaction.amount
      );
    }

    await CheckTransaction.findByIdAndDelete(id);
    return NextResponse.json({
      message: "Check transaction deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};