import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import PendingUser from "@/Models/PendingUser";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const pendingUser = await PendingUser.findOne({
      email,
    });

    if (!pendingUser) {
      return NextResponse.json(
        {
          error:
            "Verification session expired. Please register again.",
        },
        { status: 404 }
      );
    }

    const COOLDOWN = 60 * 1000;

    if (
      pendingUser.lastOtpSentAt &&
      Date.now() -
        pendingUser.lastOtpSentAt.getTime() <
        COOLDOWN
    ) {
      const remainingSeconds = Math.ceil(
        (COOLDOWN -
          (Date.now() -
            pendingUser.lastOtpSentAt.getTime())) /
          1000
      );

      return NextResponse.json(
        {
          error: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
        },
        { status: 429 }
      );
    }

    const generatedOTP = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    pendingUser.emailOTP = await bcrypt.hash(
      generatedOTP,
      10
    );

    pendingUser.lastOtpSentAt = new Date();

    pendingUser.expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pendingUser.save();

    await sendOTP(email, generatedOTP);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Resend OTP Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to resend OTP",
      },
      { status: 500 }
    );
  }
}

async function sendOTP(email, otp) {
  const transporter =
    nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  await transporter.sendMail({
    from: `"CivicLedger" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Email Verification</h2>

        <p>Your OTP is:</p>

        <h1 style="
          letter-spacing:4px;
          color:#2563eb;
        ">
          ${otp}
        </h1>

        <p>
          This OTP expires in 10 minutes.
        </p>

        <p>
          If you did not request this,
          please ignore this email.
        </p>
      </div>
    `,
  });
}