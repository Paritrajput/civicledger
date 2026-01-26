import { dbConnect } from "@/lib/dbConnect";
import Bid from "@/Models/Bid";
import Tender from "@/Models/Tender";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await dbConnect();

    const now = new Date();

    // 1️⃣ Only evaluate OPEN tenders whose bidding is over
    const tenders = await Tender.find({
      status: "OPEN",
      bidClosingDate: { $lte: now },
    });
    console.log(`Found ${tenders.length} tenders to evaluate`);

    if (!tenders.length) {
      return NextResponse.json({
        message: "No tenders ready for evaluation",
      });
    }

    for (const tender of tenders) {
      // 2️⃣ Fetch only pending bids
      const bids = await Bid.find({
        tenderId: tender._id,
        status: "Pending",
      });

      if (bids.length === 0) {
        // Still close bidding even if no bids
        tender.status = "BIDDING_CLOSED";
        await tender.save();
        continue;
      }

      // 3️⃣ Normalization helpers
      const bidAmounts = bids.map(b => b.bidAmount);
      const expYears = bids.map(b => b.experienceYears || 0);
      const ratings = bids.map(b => b.contractorRating || 0);

      const minBid = Math.min(...bidAmounts);
      const maxBid = Math.max(...bidAmounts);
      const maxExp = Math.max(...expYears);
      const maxRating = Math.max(...ratings);

      let bestBid = null;
      let bestScore = Infinity;

      // 4️⃣ Score each bid
      for (const bid of bids) {
        const bidNorm =
          maxBid === minBid
            ? 0
            : (bid.bidAmount - minBid) / (maxBid - minBid);

        const expNorm =
          maxExp === 0 ? 1 : 1 - bid.experienceYears / maxExp;

        const ratingNorm =
          maxRating === 0 ? 1 : 1 - bid.contractorRating / maxRating;

        const score =
          0.6 * bidNorm +
          0.25 * expNorm +
          0.15 * ratingNorm;

        bid.score = Number(score.toFixed(4));
        bid.evaluation = {
          systemRecommended: false,
          evaluatedAt: new Date(),
        };

        await bid.save();

        if (score < bestScore) {
          bestScore = score;
          bestBid = bid;
        }
      }

      // 5️⃣ Mark ONE system-recommended bid
      if (bestBid) {
        bestBid.evaluation.systemRecommended = true;
        await bestBid.save();
      }

      // 6️⃣ Close bidding (not award!)
      tender.status = "BIDDING_CLOSED";
      await tender.save();
    }

    return NextResponse.json({
      success: true,
      message: "Bids evaluated and system recommendation generated",
    });
  } catch (error) {
    console.error("Bid evaluation failed:", error);
    return NextResponse.json(
      { error: "Bid evaluation failed" },
      { status: 500 }
    );
  }
}
