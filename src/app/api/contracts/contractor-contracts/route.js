import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    /* ---------------- AUTH ---------------- */
    const user = await getUserFromRequest(req);

    if (!user || user.role !== "contractor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    /* ---------------- FETCH CONTRACTS ---------------- */
    const contracts = await Contract.find({
      contractor: user.id,
    })
      .sort({ createdAt: -1 })
      .select(
        "_id contractId contractValue paidAmount status milestonePlanStatus createdAt"
      )
      .lean();

    return NextResponse.json(contracts, { status: 200 });
  } catch (error) {
    console.error("Contractor contracts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
