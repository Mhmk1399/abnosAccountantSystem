import { NextResponse, NextRequest } from "next/server";

// Workflow system disabled - using daily book creator service instead
export const POST = async (req: NextRequest) => {
  return NextResponse.json({ 
    message: "Workflow system disabled - using daily book creator service instead" 
  }, { status: 200 });
};