import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await dbConnect();
  const formData = await req.formData();

  const contractId = formData.get("contractId");
  const milestoneId = formData.get("milestoneId");
  const userId = formData.get("userId");
  const vote = formData.get("vote"); // approve / reject
  const comment = formData.get("comment");
  const image = formData.get("image");

  const contract = await Contract.findById(contractId);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.status !== "UnderReview") {
    return NextResponse.json(
      { error: "Voting not allowed at this stage" },
      { status: 400 }
    );
  }

  const alreadyVoted = milestone.publicVotesLog.find(
    (v) => v.userId?.toString() === userId
  );
  if (alreadyVoted) {
    return NextResponse.json(
      { error: "You already voted" },
      { status: 400 }
    );
  }

  let attachmentUrl = null;
  if (image && typeof image.arrayBuffer === "function") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const upload = await cloudinary.v2.uploader.upload(
      `data:${image.type};base64,${buffer.toString("base64")}`,
      { folder: "milestone-public-votes" }
    );
    attachmentUrl = upload.secure_url;
  }

  milestone.publicVotesLog.push({
    userId,
    vote,
    comment,
    attachment: attachmentUrl,
  });

  milestone.publicVotes[vote] += 1;

  await contract.save();

  return NextResponse.json({ success: true });
}
