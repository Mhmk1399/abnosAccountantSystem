import { NextResponse, NextRequest } from "next/server";
import AccountGroup from "@/models/accounts/accountGroup";
import connect from "../../../../lib/data";
import { generateAccountGroupCode } from "@/lib/codeGenerator";

// GET: Retrieve all account groups
export const GET = async () => {
  await connect();
  try {
    const accountGroups = await AccountGroup.find();
    return NextResponse.json({ accountGroups });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};

// POST: Create a new account group
export const POST = async (req: NextRequest) => {
  await connect();
  try {
    const body = await req.json();
    const code = await generateAccountGroupCode();
    const accountGroup = await AccountGroup.create({ ...body, code });
    return NextResponse.json({ accountGroup }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 }
    );
  }
};
