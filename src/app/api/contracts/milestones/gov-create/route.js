import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    // const user = await getUserFromRequest(req);

    // if (!user || user.role !== "gov") {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 403 }
    //   );
    // }

    const { contractId, milestones } = await req.json();

    if (!contractId || !Array.isArray(milestones) || milestones.length === 0) {
      return NextResponse.json(
        { error: "Invalid milestone payload" },
        { status: 400 },
      );
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    if (contract.milestonePlanStatus !== "DRAFT") {
      return NextResponse.json(
        { error: "Milestones already submitted or locked" },
        { status: 400 },
      );
    }

    let totalAmount = 0;

    for (const m of milestones) {
      if (!m.title || !m.amount || !m.dueDate) {
        return NextResponse.json(
          { error: "Each milestone must have title, amount, and dueDate" },
          { status: 400 },
        );
      }

      const graceDays = Number(m.gracePeriodDays);
      if (isNaN(graceDays) || graceDays < 0) {
        return NextResponse.json(
          { error: "Grace period days must be a valid non-negative number" },
          { status: 400 },
        );
      }

      totalAmount += Number(m.amount);
    }

    if (totalAmount > contract.contractValue) {
      return NextResponse.json(
        { error: "Milestone total exceeds contract value" },
        { status: 400 },
      );
    }

    contract.proposedMilestones = milestones.map((m) => {
      const graceDays = Number(m.gracePeriodDays) || 0;
      return {
        title: m.title,
        description: m.description || "",
        amount: Number(m.amount),
        dueDate: new Date(m.dueDate),
        gracePeriodDays: graceDays,
      };
    });

    contract.milestonePlanStatus = "CONTRACTOR_REVIEW";

    await contract.save();

    return NextResponse.json({
      success: true,
      message: "Milestones submitted for contractor review",
    });
  } catch (error) {
    console.error("Milestone creation error:", error);
    return NextResponse.json(
      { error: "Failed to create milestones" },
      { status: 500 },
    );
  }
}
