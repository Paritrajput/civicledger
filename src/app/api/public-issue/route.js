import { dbConnect } from "@/lib/dbConnect";
import Issue from "@/Models/Issue";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getUserFromRequest } from "@/lib/auth";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: "dt1cqoxe8",
  api_key: "736378735539485",
  api_secret: "iJfGZ2TqF348thygERO5RzVgjpM",
});



export async function POST(req) {
  try {
    await dbConnect();


    const user = getUserFromRequest(req);

    if (!user || user.role !== "public") {
      return NextResponse.json(
        { error: "Only public users can raise issues" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const body = {};

    formData.forEach((value, key) => {
      body[key] = value;
    });

    if (!body.issue_type || !body.description || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let parsedLocation;
    try {
      const loc = JSON.parse(body.location);
      const lat = Number(loc.lat);
      const lng = Number(loc.lng);

      if (isNaN(lat) || isNaN(lng)) throw new Error();

      parsedLocation = {
        type: "Point",
        coordinates: [lng, lat],
        placeName: body.placename || "",
      };
    } catch {
      return NextResponse.json(
        { error: "Invalid location format" },
        { status: 400 }
      );
    }

    const images = [];

    if (body.image instanceof Blob) {
      const buffer = Buffer.from(await body.image.arrayBuffer());
      const uploadRes = await cloudinary.v2.uploader.upload(
        `data:${body.image.type};base64,${buffer.toString("base64")}`,
        { folder: "contracker/issues" }
      );
      images.push(uploadRes.secure_url);
    }


    const issue = await Issue.create({
      reportedBy: new mongoose.Types.ObjectId(user.id),
      issue_type: body.issue_type.trim(),
      description: body.description.trim(),
      images,
      location: parsedLocation,

      status: "PENDING_VALIDATION",

      publicValidation: {
        approvals: 0,
        rejections: 0,
        voters: [],
      },

      aiVerification: {},
      governmentReview: {},
    });

    return NextResponse.json(
      { message: "Issue submitted successfully", issue },
      { status: 201 }
    );
  } catch (error) {
    console.error("Issue creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await dbConnect();

    const issues = await Issue.find({ status: "PENDING_VALIDATION" })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ issues }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
