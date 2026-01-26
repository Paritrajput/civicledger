import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import Tender from "@/Models/Tender";
import Contractor from "@/Models/Contractor";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { contractId } = await params;

    if (!contractId) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 },
      );
    }

    const contract = await Contract.findById(contractId)
      .populate({
        path: "contractor",
        select:
          "name experienceYears contractorRating isVerifiedByGov activeProjects completedProjects",
      })

      .populate({
        path: "tenderId",
        select: "title location bidClosingDate",
      });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        contract,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch contract error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 },
    );
  }
}
