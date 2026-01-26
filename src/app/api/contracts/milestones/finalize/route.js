import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";

export async function POST(req) {
  try {
    await dbConnect();

    const {
      contractId,
      milestoneId,
      action, 
      overrideReason,
    } = await req.json();

    if (!contractId || !milestoneId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }


    if (milestone.status !== "GovReview") {
      return NextResponse.json(
        { error: "Milestone not in GovReview stage" },
        { status: 400 }
      );
    }

    if (milestone.fundRelease?.released) {
      return NextResponse.json(
        { error: "Milestone already paid" },
        { status: 400 }
      );
    }

    if (!milestone.finalEvaluation) {
      return NextResponse.json(
        { error: "Final evaluation not calculated" },
        { status: 400 }
      );
    }


    let finalDecision;

    if (action === "ACCEPT") {
      finalDecision = milestone.finalEvaluation.recommended
        ? "Approved"
        : "Rejected";
    }

    if (action === "OVERRIDE") {
      if (!overrideReason) {
        return NextResponse.json(
          { error: "Override reason required" },
          { status: 400 }
        );
      }

      milestone.finalEvaluation.overridden = true;
      milestone.finalEvaluation.overrideReason = overrideReason;

      
      finalDecision = "Approved";
    }


    milestone.status = finalDecision;

    if (finalDecision === "Approved") {
      milestone.fundRelease = {
        released: true,
        releasedAt: new Date(),
      };

      contract.paidAmount += milestone.amount;
    }

    milestone.finalEvaluation.calculatedAt =
      milestone.finalEvaluation.calculatedAt || new Date();

    await contract.save();

    return NextResponse.json({
      success: true,
      message: `Milestone ${finalDecision}`,
      milestoneStatus: milestone.status,
      paidAmount: contract.paidAmount,
    });
  } catch (err) {
    console.error("Gov finalize milestone error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
