
import Public from "@/Models/Public";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const { email } = await req.json();

  const user = await Public.findOne({ email });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (user.isVerified) {
    return new Response("Email already verified", { status: 400 });
  }

  // cooldown (60 seconds)
  if (
    user.otpExpiry &&
    user.otpExpiry.getTime() - Date.now() > 9 * 60 * 1000
  ) {
    return new Response(
      JSON.stringify({ message: "Please wait before requesting again" }),
      { status: 429 }
    );
  }

  let generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
   user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10min
   user.emailOTP = await bcrypt.hash(generatedOTP, 10);

  await user.save();
  await sendOTP(email, generatedOTP);

  return NextResponse.json({ success: true, message: "OTP sent successfully" });
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
