export async function POST(req) {
  await dbConnect();
  const { contractId, milestoneId, vote } = await req.json();

  const contract = await Contract.findById(contractId);
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone || milestone.status !== "GovReview") {
    return NextResponse.json({ error: "Invalid milestone state" }, { status: 400 });
  }

  /* ---------- CALCULATE ---------- */
  const result = calculateFinalScore({
    aiScore: milestone.aiVerification?.score || 0,
    publicApprove: milestone.publicVotes.approve,
    publicReject: milestone.publicVotes.reject,
    govVote: vote,
  });

  milestone.finalEvaluation = {
    ...result,
    calculatedAt: new Date(),
  };

  milestone.status = result.recommended ? "Approved" : "Rejected";

  await contract.save();

  return NextResponse.json({
    success: true,
    evaluation: milestone.finalEvaluation,
  });
}
function calculateFinalScore({ aiScore, publicApprove, publicReject, govVote }) {
  /* ---------- AI ---------- */
  const ai = Math.min(Math.max(aiScore ?? 0, 0), 100); // clamp

  /* ---------- PUBLIC ---------- */
  const totalPublic = publicApprove + publicReject;
  const publicScore =
    totalPublic === 0
      ? 50
      : Math.round((publicApprove / totalPublic) * 100);

  /* ---------- GOV ---------- */
  const govScore = govVote === "Approve" ? 100 : 0;

  /* ---------- FINAL ---------- */
  const finalScore =
    0.4 * ai +
    0.3 * publicScore +
    0.3 * govScore;

  return {
    aiScore: ai,
    publicScore,
    govScore,
    finalScore: Math.round(finalScore),
    recommended: finalScore >= 70,
  };
}
