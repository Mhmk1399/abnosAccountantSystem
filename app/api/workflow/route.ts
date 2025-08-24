import { NextRequest, NextResponse } from "next/server";
import Workflow from "@/models/workflow";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const workflow = await Workflow.findById(id);
      if (!workflow) {
        return NextResponse.json(
          { error: "Workflow not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(workflow);
    }

    const workflows = await Workflow.find();
    return NextResponse.json(workflows);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const data = await request.json();

    const workflow = new Workflow(data);
    await workflow.save();

    return NextResponse.json(workflow, { status: 201 });
  } catch (error: unknown) {
    console.error("Workflow creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create workflow",
        details: error || "Unknown error",
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
      return NextResponse.json(
        { error: "Workflow ID required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const workflow = await Workflow.findByIdAndUpdate(id, data, { new: true });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Workflow ID required" },
        { status: 400 }
      );
    }

    const workflow = await Workflow.findByIdAndDelete(id);

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
