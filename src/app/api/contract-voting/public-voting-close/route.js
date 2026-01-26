import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const now = new Date();

  const contracts = await Contract.find({
    "milestones.publicVoting.closed": false,
    "milestones.publicVoting.closesAt": { $lte: now },
  });

  for (const contract of contracts) {
    let updated = false;

    contract.milestones.forEach((m) => {
      if (
        m.publicVoting &&
        !m.publicVoting.closed &&
        m.publicVoting.closesAt <= now
      ) {
        m.publicVoting.closed = true;
        m.status = "GovReview"; // NEXT STAGE
        updated = true;
      }
    });

    if (updated) {
      await contract.save();
    }
  }

  return NextResponse.json({
    success: true,
    message: "Public voting auto-closed",
  });
}
