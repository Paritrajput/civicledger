import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";

/**
 * Contractor directly accepts government milestone plan
 */
export async function POST(req) {
  try {
    await dbConnect();

    const { contractId } = await req.json();

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required" },
        { status: 400 }
      );
    }

    /* ---------------- FETCH CONTRACT ---------------- */

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    /* ---------------- STATE GUARD ---------------- */

    if (contract.milestonePlanStatus !== "CONTRACTOR_REVIEW") {
      return NextResponse.json(
        {
          error:
            "Milestones cannot be accepted in current contract state",
        },
        { status: 400 }
      );
    }

    if (!contract.proposedMilestones?.length) {
      return NextResponse.json(
        { error: "No proposed milestones to accept" },
        { status: 400 }
      );
    }

    /* ---------------- FINALIZE MILESTONES ---------------- */

    contract.milestones = contract.proposedMilestones.map((m) => ({
      title: m.title,
      description: m.description,
      amount: m.amount,
      dueDate: m.dueDate,
      status: "Pending",
      proofs: [],
      votes: [],
    }));

    contract.proposedMilestones = [];
    contract.proposalReason = null;
    contract.milestonePlanStatus = "FINALIZED";

    await contract.save();

    return NextResponse.json({
      success: true,
      message: "Milestones accepted and finalized successfully",
    });
  } catch (error) {
    console.error("Accept milestone error:", error);
    return NextResponse.json(
      { error: "Failed to accept milestones" },
      { status: 500 }
    );
  }
}
