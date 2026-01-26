import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";

export async function POST(req) {
  try {
    await dbConnect();

    const { contractId, proposedMilestones, proposalReason } = await req.json();

    if (!contractId || !proposedMilestones?.length || !proposalReason) {
      return NextResponse.json(
        { error: "contractId, milestones and reason are required" },
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

    if (contract.milestonePlanStatus !== "GOV_REVIEW") {
      return NextResponse.json(
        { error: "Contract not in GOV_REVIEW state" },
        { status: 400 }
      );
    }

    // Replace contractor proposal with edited gov proposal
    contract.proposedMilestones = proposedMilestones.map((m) => ({
      title: m.title,
      description: m.description,
      amount: Number(m.amount),
      dueDate: new Date(m.dueDate),
    }));

    contract.proposalReason = proposalReason;
    contract.milestonePlanStatus = "CONTRACTOR_REVIEW";

    await contract.save();

    return NextResponse.json({
      success: true,
      message: "Milestones re-proposed to contractor",
    });
  } catch (error) {
    console.error("Gov re-proposal error:", error);
    return NextResponse.json(
      { error: "Failed to re-propose milestones" },
      { status: 500 }
    );
  }
}
