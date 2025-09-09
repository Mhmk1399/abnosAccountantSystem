import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JWTPayload {
  id: string;
  name: string;
  role: "seller" | "manager" | "supervisor";
  exp?: number;
  iat?: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT secret not configured" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    return NextResponse.json({
      id: decoded.id,
      username: decoded.name,
      role: decoded.role || "seller",
    });
  } catch (error) {
    console.log("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
