import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";


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

  

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }



    if (contract.milestonePlanStatus !== "GOV_REVIEW") {
      return NextResponse.json(
        {
          error:
            "Contract is not in GOV_REVIEW state",
        },
        { status: 400 }
      );
    }

    if (!contract.proposedMilestones?.length) {
      return NextResponse.json(
        { error: "No counter milestones to accept" },
        { status: 400 }
      );
    }

  

    contract.milestones = contract.proposedMilestones.map((m) => ({
      title: m.title,
      description: m.description,
      amount: m.amount,
      dueDate: m.dueDate,
      gracePeriodDays: m.gracePeriodDays,
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
      message: "Counter milestones accepted and finalized",
    });
  } catch (error) {
    console.error("Gov accept counter error:", error);
    return NextResponse.json(
      { error: "Failed to accept counter proposal" },
      { status: 500 }
    );
  }
}
