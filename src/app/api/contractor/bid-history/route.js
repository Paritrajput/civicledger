import { getUserFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import Bid from "@/Models/Bid";


export async function GET(req) {
  await dbConnect();

  try {
    const user = await getUserFromRequest(req);

    const contractorId = user.id;

    if (!contractorId) {
      return new Response(
        JSON.stringify({ error: "Contractor ID is required" }),
        { status: 400 },
      );
    }

    const bids = await Bid.find({ contractorId })
      .populate({
        path: "tenderId",
        select: "title description location",
      })
      .sort({ createdAt: -1 });

const response = bids.map((bid) => ({
  _id: bid._id,

  tenderId: bid.tenderId?._id,
  tenderTitle: bid.tenderId?.title,
  tenderDescription: bid.tenderId?.description,

  bidAmount: bid.bidAmount,
  experience: bid.experience,

  proposalDocument: bid.proposalDocument,

  status: bid.status || "PENDING",
  selectionType: bid.selectionType || "SYSTEM",
  systemScore: bid.systemScore,
  rank: bid.rank,

  createdAt: bid.createdAt,
  evaluatedAt: bid.evaluatedAt,
}));

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Bid history error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch bid history" }),
      { status: 500 },
    );
  }
}
