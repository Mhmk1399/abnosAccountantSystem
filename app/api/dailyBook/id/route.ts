import { NextResponse, NextRequest } from "next/server";
import DailyBook from "@/models/dailyBook";
import connect from "@/lib/data";

// PATCH: Update a daily book by ID
export const PATCH = async (req: NextRequest) => {
    await connect();
    const id = req.headers.get("id");
    try {
        const body = await req.json();
        const dailyBook = await DailyBook.findByIdAndUpdate(id, body, { new: true });
        if (!dailyBook) {
            return NextResponse.json({ error: 'Daily book not found' }, { status: 404 });
        }
        return NextResponse.json({ dailyBook });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// DELETE: Delete a daily book by ID
export const DELETE = async (req: NextRequest) => {
    await connect();
    const id = req.headers.get("id");
    try {
        const dailyBook = await DailyBook.findByIdAndDelete(id);
        if (!dailyBook) {
            return NextResponse.json({ error: 'Daily book not found' }, { status: 404 });
        }
        return NextResponse.json({ message: "Daily book deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}