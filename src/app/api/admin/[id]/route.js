import { NextResponse } from "next/server";
import AdminRequest from "@/Models/AdminRequest";
import { dbConnect } from "@/lib/dbConnect";
import Government from "@/Models/Government";

export async function POST(req, context) {
  await dbConnect();

  try {
    const params = await context.params;
    const { id } = params;
    const { ownerId } = await req.json();

    const adminRequest = await AdminRequest.findById(id);
    if (!adminRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const user = await Government.findById(adminRequest.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.verifiedBy = ownerId;
    user.isVerified = true;
    await user.save();

    adminRequest.isVerified = true;
    await adminRequest.save();
    await sendWinnerNotification(user.email, user.name);
    return NextResponse.json(
      { message: "Admin request approved", data: adminRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving admin request:", error);
    return NextResponse.json(
      { error: "Error approving admin request" },
      { status: 500 }
    );
  }
}

async function sendWinnerNotification(email, name) {
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
      subject: "🎉 You're Verified! Welcome to ConTracker Admin Panel",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2c3e50; text-align: center;">🎉 Congratulations, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              We are thrilled to inform you that you have been successfully verified by the ConTracker owners!  
              You can now log in and access the admin panel.
            </p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="https://contracker-six.vercel.app/authenticate/gov-auth/login" 
                 style="background: #007bff; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                🔑 Go to Login Page
              </a>
            </p>
            <p style="font-size: 14px; color: #555; text-align: center;">
              If you did not request this verification, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="text-align: center; font-size: 14px; color: #888;">
              Best Regards,<br>
              <strong>ConTracker Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
