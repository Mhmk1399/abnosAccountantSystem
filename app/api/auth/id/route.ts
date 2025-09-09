import connect from "@/lib/data";
import User from "@/models/user";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  await connect();
  if (!connect) {
    return NextResponse.json({ error: "connection failed" });
  }
  try {
    const token = await request.headers.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decodedToken || typeof decodedToken !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      phoneNumber: user.phoneNumber,
      id: user._id,
      role: user.role,
    });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(
      { error: error, messege: "internal error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connect();
  if (!connect) {
    return NextResponse.json({ error: "connection failed" });
  }
  try {
    const body = await request.json();
    const token = request.headers.get("token");
    const decodedToken = jwt.verify(token!, process.env.JWT_SECRET!);
    if (!decodedToken || typeof decodedToken !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const id = decodedToken.id;
    const user = await User.findById(id);
    let newUser: {
      username?: string;
      phoneNumber?: string;
      password?: string;
    } = {};
    if (body.password && body.password.trim() !== "") {
      newUser = {
        username: body.username,
        phoneNumber: body.phoneNumber,
        password: body.password,
      };
    } else {
      newUser = {
        username: body.username,
        phoneNumber: body.phoneNumber,
      };
    }
    // If password is provided, hash it and add to update
    if (body.password && body.password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      newUser.password = hashedPassword;
    }

    await User.findByIdAndUpdate(id, newUser);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
