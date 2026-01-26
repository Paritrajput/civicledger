import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contractor from "@/Models/Contractor";
import Contract from "@/Models/Contract";

export async function POST(req) {
  try {
    await dbConnect();

    const { contractorId, contractId, userId, rating, comment } =
      await req.json();

    /* ---------------- Validations ---------------- */

    if (!contractorId || !contractId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

   
    if (!["Active", "Completed"].includes(contract.status)) {
      return NextResponse.json(
        { error: "Contract not eligible for rating" },
        { status: 403 }
      );
    }

    if (contract.contractor.toString() !== contractorId) {
      return NextResponse.json(
        { error: "Contractor mismatch" },
        { status: 400 }
      );
    }

    const contractor = await Contractor.findById(contractorId);
    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }



    const alreadyRated = contractor.ratings?.find(
      (r) =>
        r.userId.toString() === userId &&
        r.contractId.toString() === contractId
    );

    if (alreadyRated) {
      return NextResponse.json(
        { error: "You have already rated this contractor for this contract" },
        { status: 409 }
      );
    }

    /* ---------------- Save Rating ---------------- */

    contractor.ratings.push({
      userId,
      contractId,
      rating,
      comment: comment || "",
    });

    // Recalculate average safely
    const totalRatings = contractor.ratings.length;
    const totalScore = contractor.ratings.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    contractor.contractorRating = {
      average: Number((totalScore / totalRatings).toFixed(2)),
      count: totalRatings,
    };

    await contractor.save();

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
      contractorRating: contractor.contractorRating,
    });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
