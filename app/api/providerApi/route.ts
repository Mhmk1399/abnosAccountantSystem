import { NextRequest } from "next/server";
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from "@/middleware/provider";
import connect from "@/lib/data";

export async function GET(req: NextRequest) {
  await connect();
  return getProviders(req);
}

export async function POST(req: NextRequest) {
  await connect();
  return createProvider(req);
}

export async function PATCH(req: NextRequest) {
  await connect();
  return updateProvider(req);
}

export async function DELETE(req: NextRequest) {
  await connect();
  return deleteProvider(req);
}
