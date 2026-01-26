import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";

/**
 * Contractor submits counter milestone proposal
 */
export async function POST(req) {
  try {
    await dbConnect();

    const { contractId, proposedMilestones, proposalReason } =
      await req.json();

    /* ---------------- VALIDATION ---------------- */

    if (!contractId || !Array.isArray(proposedMilestones)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (proposedMilestones.length === 0) {
      return NextResponse.json(
        { error: "At least one milestone is required" },
        { status: 400 }
      );
    }

    if (!proposalReason || proposalReason.trim().length < 10) {
      return NextResponse.json(
        { error: "Proposal reason is required (min 10 chars)" },
        { status: 400 }
      );
    }

    /* ---------------- CONTRACT ---------------- */

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.milestonePlanStatus !== "CONTRACTOR_REVIEW") {
      return NextResponse.json(
        {
          error:
            "Counter proposal not allowed in current contract state",
        },
        { status: 400 }
      );
    }

    /* ---------------- SANITIZE MILESTONES ---------------- */

    const sanitizedMilestones = proposedMilestones.map((m) => ({
      title: m.title?.trim(),
      description: m.description?.trim(),
      amount: Number(m.amount),
      dueDate: new Date(m.dueDate),
    }));

    for (const m of sanitizedMilestones) {
      if (!m.title || !m.amount || !m.dueDate) {
        return NextResponse.json(
          { error: "Each milestone must have title, amount & due date" },
          { status: 400 }
        );
      }
    }

    /* ---------------- UPDATE CONTRACT ---------------- */

    contract.proposedMilestones = sanitizedMilestones;
    contract.proposalReason = proposalReason.trim();
    contract.milestonePlanStatus = "GOV_REVIEW";
    contract.negotiationRound += 1;

    await contract.save();

    return NextResponse.json({
      success: true,
      message: "Counter milestone proposal submitted successfully",
    });
  } catch (error) {
    console.error("Counter milestone error:", error);
    return NextResponse.json(
      { error: "Failed to submit counter proposal" },
      { status: 500 }
    );
  }
}
