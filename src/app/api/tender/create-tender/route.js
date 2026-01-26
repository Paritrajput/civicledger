import { dbConnect } from "@/lib/dbConnect";

import Issue from "@/Models/Issue";
import { ethers } from "ethers";
import { NextResponse } from "next/server";
import TenderContract from "@/contracts/TenderCreation.json";
import { getUserFromRequest } from "@/lib/auth";
import cloudinary from "cloudinary";
import Tender from "@/Models/Tender";



// Cloudinary config 
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();




    const user = await getUserFromRequest(req);
    if (!user || user.role !== "gov") {
      return NextResponse.json(
        { error: "Only Government can create tenders" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category") || "";
    const minBidAmount = formData.get("minBidAmount");
    const maxBidAmount = formData.get("maxBidAmount");
    const bidOpeningDate = formData.get("bidOpeningDate");
    const bidClosingDate = formData.get("bidClosingDate");
    const location = formData.get("location");
    const issueId = formData.get("issueId");

    if (
      !title ||
      !description ||
      !minBidAmount ||
      !maxBidAmount ||
      !bidOpeningDate ||
      !bidClosingDate ||
      !location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //uplod documents
    const attachments = [];
    const files = formData.getAll("documents");

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await cloudinary.v2.uploader.upload(
        `data:${file.type};base64,${buffer.toString("base64")}`,
        {
          folder: "contracker/tenders",
          resource_type: "raw",
        }
      );

      attachments.push({
        name: file.name,
        url: upload.secure_url,
        type: file.type,
      });
    }

    // issue-based
    let source = "DIRECT";
    let issueSnapshot = null;

    if (issueId) {
      const issue = await Issue.findById(issueId);

      if (!issue || issue.status == "GOV_REJECTED") {
        return NextResponse.json(
          { error: "Issue not approved for tender creation" },
          { status: 400 }
        );
      }

      const existingTender = await Tender.findOne({
        "issue.issueId": issue._id,
      });

      if (existingTender) {
        return NextResponse.json(
          { error: "Tender already exists for this issue" },
          { status: 400 }
        );
      }

      source = "ISSUE";
      issueSnapshot = {
        issueId: issue._id,
        description: issue.description,
        placeName: issue.location.placeName,
      };
    }

    const tender = await Tender.create({
      title,
      description,
      category,
      minBidAmount,
      maxBidAmount,
      bidOpeningDate,
      bidClosingDate,
      location,
      attachments,
      source,
      issue: issueSnapshot,
      createdBy: user.id,
      status: "DRAFT",
    });

    // blockchain
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    const wallet = new ethers.Wallet(
      process.env.NEXT_PUBLIC_PRIVATE_KEY,
      provider
    );

    const contract = new ethers.Contract(
      process.env.TENDER_CONTRACT_ADDRESS,
      TenderContract.abi,
      wallet
    );

    const tx = await contract.createTender(
      title,
      description,
      category,
      ethers.parseEther(String(minBidAmount)),
      ethers.parseEther(String(maxBidAmount)),
      Math.floor(new Date(bidOpeningDate).getTime() / 1000),
      Math.floor(new Date(bidClosingDate).getTime() / 1000),
      issueSnapshot?.placeName || "DIRECT",
      String(user.id)
    );

    const receipt = await tx.wait();

    let blockchainTenderId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === "TenderCreated") {
          blockchainTenderId = parsed.args[0].toString();
          break;
        }
      } catch {}
    }

    if (!blockchainTenderId) {
      throw new Error("Blockchain tender ID not found");
    }


    tender.blockchain = {
      tenderId: blockchainTenderId,
      transactionHash: receipt.transactionHash,
      network: "POLYGON",
    };
    tender.status = "OPEN";
    await tender.save();

    return NextResponse.json(
      { message: "Tender created successfully", tenderId: tender._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Tender creation failed:", error);
    return NextResponse.json(
      { error: "Tender creation failed" },
      { status: 500 }
    );
  }
}
