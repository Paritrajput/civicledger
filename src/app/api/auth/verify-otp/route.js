import { dbConnect } from "@/lib/dbConnect";
import Public from "@/Models/Public";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import PendingUser from "@/Models/PendingUser";

export async function POST(req) {
  await dbConnect();
  const { email, otp } = await req.json();

  const pendingUser = await PendingUser.findOne({ email });

  if (!pendingUser) {
    return NextResponse.json(
      { error: "OTP expired or invalid" },
      { status: 400 },
    );
  }

  const isValid = await bcrypt.compare(otp, pendingUser.emailOTP);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }
  await Public.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    is_verified: true,
  });
  await PendingUser.deleteOne({
    email,
  });

  return NextResponse.json(
    {
      success: true,
      message: "Email verified successfully",
    },
    { status: 200 },
  );
}
