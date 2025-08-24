import data from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import FiscalYear from "@/models/fiscalYear";

export const GET = async (req: NextRequest) => {
    await data();
    try {
        const id = req.headers.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const fiscalYear = await FiscalYear.findById(id);
        if (!fiscalYear) {
            return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 });
        }
        return NextResponse.json({ data: fiscalYear });
    } catch (error) {
        console.error("Error fetching fiscal year:", error);
        return NextResponse.json({ error: 'Failed to fetch fiscal year' }, { status: 500 });
    }
};

export const DELETE = async (req: NextRequest) => {
    await data();
    try {
        const id = req.headers.get("id");
        
        if (!id) {
            return NextResponse.json(
                { error: "Fiscal year not found" },
                { status: 404 }
            );
        }
        await FiscalYear.findByIdAndDelete(id);
        
        return NextResponse.json({ message: "Fiscal year deleted successfully" });
    } catch (error) {
        console.error("Error deleting fiscal year:", error);
        return NextResponse.json(
            { error: "Failed to delete fiscal year" },
            { status: 500 }
        );
    }
};