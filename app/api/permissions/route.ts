import data from "@/lib/data";
import { NextResponse, NextRequest } from "next/server";
import Permission from "@/models/permission";

// GET: Retrieve all permissions
export const GET = async () => {
    await data();
    try {
        const permissions = await Permission.find().populate('staff');
        return NextResponse.json({ permissions });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// POST: Create a new permission
export const POST = async (req: NextRequest) => {
    await data();
    try {
        const body = await req.json();
        const permission = await Permission.create(body);
        return NextResponse.json({ permission }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// DELETE: Delete a permission by ID
export const DELETE = async (req: NextRequest) => {
    await data();
    try {
        const id = req.headers.get('id');
        const permission = await Permission.findByIdAndDelete(id);
        if (!permission) {
            return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
        }
        return NextResponse.json({ permission });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}

// PUT: Update a permission by ID
export const PATCH = async (req: NextRequest) => {
    await data();
    try {
        const body = await req.json();
        const permission = await Permission.findByIdAndUpdate(body._id, body, { new: true });
        if (!permission) {
            return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
        }
        return NextResponse.json({ permission });
    } catch (error) {
        return NextResponse.json({ error: 'An error occurred: ' + error }, { status: 500 });
    }
}