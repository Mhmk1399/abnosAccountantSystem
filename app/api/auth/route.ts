import connect from "@/lib/data";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateSequentialCode } from "@/utils/codeGenerator";

export async function POST(request: Request) {
  const { username, phoneNumber, password } = await request.json();
  try {
    await connect();
    if (!connect) {
      return NextResponse.json({ error: "connection failed" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = await generateSequentialCode("User", "");
    const newUser = new User({
      username: username,
      phoneNumber,
      password: hashedPassword,
      code: code,
    });

    await newUser.save();
    const token = jwt.sign(
      {
        id: newUser._id,
        pass: hashedPassword,
        phoneNumber: newUser.phoneNumber,
        username: newUser.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1000h" }
    );

    return NextResponse.json(
      {
        message: "User created successfully",
        token,
        username: newUser.username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connect();
    const token = request.headers.get("token");
    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      username: string;
    };
    console.log("Decoded token:",decodedToken);
  

    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.log("Error fetching users:", error);

    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    await connect();
    const body = await request.json();
    console.log("Request body:", body);
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await User.findByIdAndUpdate(
      body._id,
      {
        username: body.username,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        role: body.role,
      },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.log("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: Request) {
  try {
    await connect();
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ message: "No ID provided" }, { status: 400 });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.log("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}
