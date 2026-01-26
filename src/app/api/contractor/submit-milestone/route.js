import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const milestoneId = formData.get("milestoneId");
    const notes = formData.get("notes");
    const delayReason = formData.get("delayReason");
    const images = formData.getAll("images");

    if (!milestoneId || !notes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const contract = await Contract.findOne({
      "milestones._id": milestoneId,
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const milestone = contract.milestones.id(milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

   
    const now = new Date();
    const due = new Date(milestone.dueDate);
    const graceEnd = new Date(
      due.getTime() +
        milestone.gracePeriodDays * 24 * 60 * 60 * 1000
    );

    const isOverdue = now > graceEnd;

    if (isOverdue && !delayReason) {
      return NextResponse.json(
        { error: "Delay reason required for overdue milestone" },
        { status: 400 }
      );
    }

    const uploadedProofs = [];

    for (const file of images) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      const upload = await cloudinary.v2.uploader.upload(
        `data:${file.type};base64,${base64}`,
        {
          folder: `contracker/milestones/${contract.contractId}`,
        }
      );

      uploadedProofs.push({
        fileUrl: upload.secure_url,
        type: "Image",
        uploadedBy: contract.contractor,
      });
    }





   
    milestone.status = "Submitted";
    milestone.submittedAt = now;
    milestone.delayReason = isOverdue ? delayReason : null;
  milestone.status = "Submitted";
milestone.submittedAt = now;
milestone.delayReason = isOverdue ? delayReason : null;


if (!milestone.proofs) {
  milestone.proofs = [];
}

milestone.proofs.push(...uploadedProofs);

milestone.status = "UnderReview";

// ai test verification(mock)
  const score = Math.floor(Math.random() * 40) + 60;

  milestone.aiVerification = {
    score,
    remarks: score > 70 ? "Likely completed" : "Low confidence",
    verifiedAt: new Date(),
  };

  

milestone.publicVoting = {
  opensAt: new Date(),
  closesAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1h 
  closed: false,
};


    await contract.save();

    return NextResponse.json({
      success: true,
      message: "Milestone submitted successfully",
      milestone,
    });
  } catch (error) {
    console.error("Milestone submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit milestone" },
      { status: 500 }
    );
  }
}
