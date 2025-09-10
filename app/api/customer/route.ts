import { NextRequest } from "next/server";
import { getCustomers } from "@/middleware/customer";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  await connect();
  return getCustomers(request);
}
