import { NextRequest, NextResponse } from "next/server";
import { runWorkflow } from "@/services/workFellow";
import connect from "@/lib/data";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { workflow, requestData } = await request.json();
    console.log("🚀 Backend: Executing workflow:", workflow.name);
    console.log("📊 Backend: Workflow steps:", workflow.steps.length);
    console.log("📝 Backend: Request data:", requestData);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log("🔄 Backend: Starting workflow execution...");
      const result = await runWorkflow(
        {
          model: workflow.trigger.model,
          method: workflow.trigger.method,
        },
        requestData,
        session
      );
      
      await session.commitTransaction();
      console.log("✅ Backend: Workflow executed successfully");
      console.log("📦 Backend: Workflow result:", result);
      
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error("❌ Backend: Error during workflow execution:", error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: unknown) {
    console.error("❌ Workflow execution error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to execute workflow" },
      { status: 500 }
    );
  }
}