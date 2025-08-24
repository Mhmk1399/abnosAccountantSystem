import { NextRequest } from "next/server";
import { 
  getSideMaterials, 
  createSideMaterial, 
  updateSideMaterial, 
  deleteSideMaterial 
} from "@/middleware/sideMaterial";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  await connect();
  return getSideMaterials(request);
}

export async function POST(req: NextRequest) {
    await connect();
  return createSideMaterial(req);
}

export async function PATCH(req: NextRequest) {
  await connect();
  return updateSideMaterial(req);
}

export async function DELETE(req: NextRequest) {
  await connect();
  return deleteSideMaterial(req);
}
