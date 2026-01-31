import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Government from "@/Models/Government";
import { dbConnect } from "@/lib/dbConnect";
import AdminRequest from "@/Models/AdminRequest";

export async function POST(req) {
  try {
    await dbConnect();

  
    const { name, email, password, position } = await req.json();

    const isVerified = false;
    const verifiedBy = null;

 
    const existingUser = await Government.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  
    const newGovernmentUser = new Government({
      name,
      email,
      password: hashedPassword,
      position,
      isVerified,
      verifiedBy,
    });

    const savedUser = await newGovernmentUser.save();

    const userIds = String(savedUser._id);
    const newRequest = new AdminRequest({ name, email, userId: userIds });
    await newRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: "Approval request sent successfully",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
