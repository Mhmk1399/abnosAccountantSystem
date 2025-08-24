import { NextResponse, NextRequest } from "next/server";
import TotalAccount from "@/models/accounts/totalAccount";
import FixedAccount from "@/models/accounts/fixedAccounts";
import connect from "@/lib/data";

// PATCH: Update a total account by ID
export const PATCH = async (req: NextRequest) => {
    await connect();
    const id =req.headers.get("id");
    try {
        const body = await req.json();
        const totalAccount = await TotalAccount.findByIdAndUpdate(id, body, { new: true });
        if (!totalAccount) {
            return NextResponse.json({ error: 'Total account not found' }, { status: 404 });
        }
        return NextResponse.json({ totalAccount });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// DELETE: Delete a total account by ID
export const DELETE = async (req: NextRequest) => {
    await connect();
    const id =req.headers.get("id");
    try {
        const childCount = await FixedAccount.countDocuments({ totalAccount: id });
        if (childCount > 0) {
            return NextResponse.json({ error: 'Cannot delete total account with children. Please delete child accounts first.' }, { status: 400 });
        }

        const totalAccount = await TotalAccount.findByIdAndDelete(id);
        if (!totalAccount) {
            return NextResponse.json({ error: 'Total account not found' }, { status: 404 });
        }
        return NextResponse.json({ message: "Total account deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}