import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Public from "@/Models/Public";
import { dbConnect } from "@/lib/dbConnect";
import nodemailer from "nodemailer";

export async function POST(req) {
  await dbConnect();
  const { name, email, password } = await req.json();

  const existingUser = await Public.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 400 }
    );
  }
  let generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10min
  const hashedOTP = await bcrypt.hash(generatedOTP, 10);
  const hashedPassword = await bcrypt.hash(password, 10);
  const newContractor = new Public({
    name,
    email,
    password: hashedPassword,
    emailOTP: hashedOTP,
    otpExpiry: otpExpiry,
  });
  await newContractor.save();
  await sendOTP(email, generatedOTP);

  return NextResponse.json({ success: true, message: "Signup successful" });
}
async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ConTracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Email Verification OTP",
      html: `
      <h3>Email Verification</h3>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP expires in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
