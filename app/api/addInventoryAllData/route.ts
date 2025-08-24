import { NextResponse } from "next/server";
import { getProviders } from "@/middleware/provider";
import { getGlasses } from "@/middleware/glass";
import { getSideMaterials } from "@/middleware/sideMaterial";
import connect from "@/lib/data";
//this unction is used to get all data for add inventory page
export async function GET() {
  await connect();
  try {
    // Get responses from middleware functions
    const providersResponse = await getProviders();
    const glassesResponse = await getGlasses();
    const sideMaterialsResponse = await getSideMaterials();
    // Extract the actual data from the responses
    const providers = await providersResponse.json();
    const glasses = await glassesResponse.json();
    const sideMaterials = await sideMaterialsResponse.json();


    // Return the extracted data
    return NextResponse.json({
      providers,
      glasses,
      sideMaterials,
    });
  } catch (error) {
    console.error("Error fetching all data:", error);
    return NextResponse.json({ error: "Error fetching all data" }, { status: 500 });
  }
}
