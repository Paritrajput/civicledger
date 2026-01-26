import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Issue from "@/Models/Issue";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getUserFromRequest } from "@/lib/auth";

const APPROVAL_THRESHOLD = 500;
const REJECTION_THRESHOLD = 500;



export async function PUT(req) {
  try {
    await dbConnect();


    const user = getUserFromRequest(req);

    if (!user || user.role !== "public") {
      return NextResponse.json(
        { error: "Only public users can vote" },
        { status: 403 }
      );
    }


    const { issueId, vote } = await req.json();

    if (!issueId || !["APPROVE", "REJECT"].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return NextResponse.json(
        { error: "Invalid issue ID" },
        { status: 400 }
      );
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }


    if (issue.status !== "PENDING_VALIDATION") {
      return NextResponse.json(
        { error: "Voting closed for this issue" },
        { status: 400 }
      );
    }


    const alreadyVoted = issue.publicValidation.voters.some(
      (v) => v.userId.toString() === user.id
    );

    if (alreadyVoted) {
      return NextResponse.json(
        { error: "You have already voted on this issue" },
        { status: 409 }
      );
    }


    if (vote === "APPROVE") {
      issue.publicValidation.approvals += 1;
    } else {
      issue.publicValidation.rejections += 1;
    }

    issue.publicValidation.voters.push({
      userId: new mongoose.Types.ObjectId(user.id),
      vote,
      weight: 1, // future: reputation-based
      votedAt: new Date(),
    });


    if (issue.publicValidation.approvals >= APPROVAL_THRESHOLD) {
      issue.status = "PUBLIC_VERIFIED";
    }

    if (issue.publicValidation.rejections >= REJECTION_THRESHOLD) {
      issue.status = "GOV_REJECTED";
    }

    await issue.save();

    return NextResponse.json(
      {
        message: "Vote recorded successfully",
        approvals: issue.publicValidation.approvals,
        rejections: issue.publicValidation.rejections,
        status: issue.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Issue vote error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
