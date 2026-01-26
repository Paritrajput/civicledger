import { dbConnect } from "@/lib/dbConnect";
import Bid from "@/Models/Bid";
import Tender from "@/Models/Tender";

export async function POST(req) {
  await dbConnect();

  try {
    const { contractorId } = await req.json();

    if (!contractorId) {
      return new Response(
        JSON.stringify({ error: "Contractor ID is required" }),
        { status: 400 }
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
      tenderLocation: bid.tenderId?.location,


      bidAmount: bid.bidAmount,
      experience: bid.experience,
      documentsSubmitted: bid.documents?.length || 0,

      
      status: bid.status || "PENDING", // WON | LOST | REJECTED | PENDING
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
      { status: 500 }
    );
  }
}
