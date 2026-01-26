import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

import Tender from "@/Models/Tender";
import Bid from "@/Models/Bid";
import Contract from "@/Models/Contract";
import Contractor from "@/Models/Contractor";

import nodemailer from "nodemailer";
import { getUserFromRequest } from "@/lib/auth";


export async function POST(req) {
  try {
    await dbConnect();

      const user = await getUserFromRequest(req);
      if (!user || user.role !== "gov") {
        return NextResponse.json(
          { error: "Only Government can approve bids" },
          { status: 403 }
        );
      }

    const {
      tenderId,
      winningBidId,
      manualReason = null, 
    } = await req.json();

    if (!tenderId || !winningBidId) {
      return NextResponse.json(
        { error: "tenderId and winningBidId are required" },
        { status: 400 }
      );
    }

    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }



    if (tender.status === "AWARDED") {
      return NextResponse.json(
        { error: "Tender already awarded" },
        { status: 400 }
      );
    }

    if (new Date() < tender.bidClosingDate) {
      return NextResponse.json(
        { error: "Bidding is still open" },
        { status: 400 }
      );
    }

    const winningBid = await Bid.findById(winningBidId);
    if (!winningBid) {
      return NextResponse.json(
        { error: "Winning bid not found" },
        { status: 404 }
      );
    }

    if (!winningBid.tenderId.equals(tender._id)) {
      return NextResponse.json(
        { error: "Bid does not belong to this tender" },
        { status: 400 }
      );
    }

    const isSystemRecommended =
      winningBid.evaluation?.systemRecommended === true;

    if (!isSystemRecommended && !manualReason) {
      return NextResponse.json(
        {
          error:
            "Manual selection requires a reason for audit and transparency",
        },
        { status: 400 }
      );
    }

    await Bid.updateMany(
      { tenderId: tender._id },
      { $set: { status: "Rejected" } }
    );


    winningBid.status = "Accepted";
    winningBid.awardMeta = {
      selectionType: isSystemRecommended ? "SYSTEM" : "MANUAL",
      manualReason: manualReason,
      awardedAt: new Date(),
    };
    await winningBid.save();


   const contract = await Contract.create({
  contractId: `CON-${Date.now()}`,
  tenderId: tender._id,
  contractor: winningBid.contractorId,

  contractValue: winningBid.bidAmount,
  paidAmount: 0,

  status: "Active",
  milestonePlanStatus: "DRAFT",

  milestones: [],
  location: tender.location,
  issueDetail: tender.issue,

  awardMeta: {
    selectionType: manualReason ? "MANUAL" : "SYSTEM",
    manualReason: manualReason || null,
    awardedBy: user?.id || null, // if auth exists
  },
});


    tender.status = "AWARDED";
tender.winner = winningBid.contractorId;
await tender.save();



    const contractor = await Contractor.findById(
      winningBid.contractorId
    );

    if (contractor?.email) {
      await sendWinnerNotification(
        contractor.email,
        contractor.name || "Contractor",
        tender.title,
        winningBid.bidAmount
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bid approved & contract created",
      contractId: contract._id,
      selectionType: isSystemRecommended ? "SYSTEM" : "MANUAL",
    });
  } catch (error) {
    console.error("Bid approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve bid" },
      { status: 500 }
    );
  }
}

//email notification

async function sendWinnerNotification(email, name, tenderTitle, bidAmount) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ConTracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Tender Awarded",
    html: `
      <h3>Congratulations ${name}!</h3>
      <p>
        You have been awarded the tender <b>${tenderTitle}</b>
        with a bid of <b>₹${bidAmount}</b>.
      </p>
      <p>Please log in to view contract details.</p>
    `,
  });
}
