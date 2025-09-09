import { NextRequest } from "next/server";
import {
  getInvoices,
  updateInvoice,
} from "@/middleware/invoice";
import connect from "@/lib/data";

export async function GET() {
  await connect();
  return getInvoices();
}


export async function PATCH(req: NextRequest) {
  await connect();
  return updateInvoice(req);
}

