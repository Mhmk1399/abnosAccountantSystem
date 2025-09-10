import { NextRequest } from "next/server";
import {
  getInvoices,
  updateInvoice,
} from "@/middleware/invoice";
import connect from "@/lib/data";

export async function GET(req: NextRequest) {
  await connect();
  return getInvoices(req);
}


export async function PATCH(req: NextRequest) {
  await connect();
  return updateInvoice(req);
}

