import { NextRequest } from "next/server";
import { 
  getGlasses, 
  createGlass, 
  updateGlass, 
  deleteGlass 
} from "@/middleware/glass";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
    await connect();
  return getGlasses(request);
}

export async function POST(req: NextRequest) {
  await connect();
  return createGlass(req);
}

export async function PATCH(req: NextRequest) {
  await connect();
  return updateGlass(req);
}

export async function DELETE(req: NextRequest) {
  await connect();
  return deleteGlass(req);
}
