import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Public from "@/Models/Public";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  const contractor = await Public.findOne({ email });
  if (!contractor) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, contractor.password);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    {
      id: contractor._id,
      name: contractor.name,
      email: contractor.email,
      role: "public",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );

  const response = NextResponse.json({
    success: true,
    token, 
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });

  return response;
}
