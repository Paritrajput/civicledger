import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

import Bid from "@/Models/Bid";
import Tender from "@/Models/Tender";
import Contractor from "@/Models/Contractor";
import { getUserFromRequest } from "@/lib/auth";


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(req) {
  try {
    await dbConnect();

    const user = await getUserFromRequest(req);

    if (!user || user.role !== "contractor") {
      return NextResponse.json(
        { error: "Only contractors can place bids" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const tenderId = formData.get("tenderId");
    const bidAmount = formData.get("bidAmount");
    const timeline = formData.get("timeline");
    const remarks = formData.get("remarks");
    const proposalFile = formData.get("proposal");

    if (!tenderId || !bidAmount || !proposalFile) {
      return NextResponse.json(
        { error: "Missing required bid fields" },
        { status: 400 }
      );
    }

    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (
      tender.status !== "OPEN" ||
      now < tender.bidOpeningDate ||
      now > tender.bidClosingDate
    ) {
      return NextResponse.json(
        { error: "Bidding is closed for this tender" },
        { status: 400 }
      );
    }

    const contractor = await Contractor.findById(user.id);
    if (!contractor || contractor.isBlocked) {
      return NextResponse.json(
        { error: "Contractor not eligible" },
        { status: 403 }
      );
    }

    const alreadyBid = await Bid.findOne({
      tenderId: tender._id,
      contractorId: contractor._id,
    });

    if (alreadyBid) {
      return NextResponse.json(
        { error: "You have already placed a bid" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await proposalFile.arrayBuffer());

    const upload = await cloudinary.v2.uploader.upload(
      `data:${proposalFile.type};base64,${buffer.toString("base64")}`,
      {
        folder: "contracker/bids",
        resource_type: "raw",
      }
    );

    const experienceYears = Number(contractor.experienceYears) || 0;
    const contractorRating =
      typeof contractor.contractorRating === "object"
        ? contractor.contractorRating.average
        : Number(contractor.contractorRating) || 0;

    const bid = await Bid.create({
      tenderId: tender._id,
      contractorId: contractor._id,
      bidAmount: Number(bidAmount),
      timeline,
      remarks,
      proposalDocument: upload.secure_url,

      experienceYears,
      contractorRating,

      score: null,
      evaluation: {
        systemRecommended: false,
        evaluatedAt: null,
      },

      status: "Pending",
      isLocked: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bid placed successfully",
        bidId: bid._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bid placement error:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");

    if (!tenderId) {
      return NextResponse.json(
        { error: "Tender ID is required" },
        { status: 400 }
      );
    }

    const bids = await Bid.find({ tenderId })
      .populate("contractorId", "name experienceYears contractorRating")
      .sort({ bidAmount: 1 });

    return NextResponse.json(bids, { status: 200 });
  } catch (error) {
    console.error("Fetch bids error:", error);
    return NextResponse.json(
      { error: "Error fetching bids" },
      { status: 500 }
    );
  }
}
