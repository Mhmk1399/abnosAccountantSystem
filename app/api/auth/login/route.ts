import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  await connect();
  try {
    const { phoneNumber, password } = await request.json();
    console.log("Received login request:", { phoneNumber, password });
    // Add validation logging
    console.log("Login attempt for:", phoneNumber);

    if (!phoneNumber || !password) {
      console.log("Missing credentials");
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      console.log("User not found");
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }
    console.log("User found:", user);
    const isValidPassword = await bcrypt.compare(password,user.password);

    if (!isValidPassword) {
      console.log("Invalid password");
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const tokenSecret = await process.env.JWT_SECRET;

    if (!tokenSecret) {
      console.log("JWT_SECRET missing");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        name: user.username,
        id: user._id,
        phoneNumber: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET! || "secret",
      { expiresIn: "12000000h" }
    );
    console.log("rooooole" , user.role);


    console.log("Login successful" , token);
    return NextResponse.json({ token, userId: user._id });
  } catch (error) {
    console.log("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  await connect();
  const token = request.headers.get("token");
  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 401 });
  }
  try {
    interface JwtCustomPayload {
      id: string;
      name: string;
      phoneNumber: string;
      role: string;
    }
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET! || "msl"
    ) as JwtCustomPayload;
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }
    if (user.role === "manager" || user.role === "supervisor") {
      return NextResponse.json(
        { message: "Admin access granted", userrole: user.role },
        { status: 200 }
      );
    }
    if (user.role !== "admin" || user.role !== "superAdmin") {
      console.log("Unauthorized access attempt by user:", user.username);
      return NextResponse.json(
        { message: "Unauthorized", userRole: user.role },
        { status: 403 }
      );
    }
  } catch (error) {
    console.log("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
