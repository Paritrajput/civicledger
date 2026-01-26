import Contract from "@/Models/Contract";

export async function POST(req) {
  await dbConnect();
  const { contractId, milestoneId } = await req.json();

  const contract = await Contract.findById(contractId);
  const milestone = contract.milestones.id(milestoneId);

  //  MOCK AI (replace later)
  const score = Math.floor(Math.random() * 40) + 60;

  milestone.aiVerification = {
    score,
    remarks: score > 70 ? "Likely completed" : "Low confidence",
    verifiedAt: new Date(),
  };

  milestone.status = "UnderReview";

  await contract.save();

  return NextResponse.json({ success: true, score });
}
