import { NextRequest } from "next/server";
import {
  createInventory,
  getAllInventory,
  updateInventory,
  deleteInventory,
} from "@/middleware/inventory";
import connect from "@/lib/data";

export async function POST(req: NextRequest) {
  await connect();
  return createInventory(req);
}

export async function GET(req: NextRequest) {
  await connect();
  return getAllInventory(req);
}

export async function PATCH(req: NextRequest) {
  await connect();
  return updateInventory(req);
}

export async function DELETE(req: NextRequest) {
  await connect();
  return deleteInventory(req);
}
