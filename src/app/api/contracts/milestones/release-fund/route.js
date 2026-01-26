import { dbConnect } from "@/lib/dbConnect";
import Contract from "@/Models/Contract";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req) {
  try {
    await dbConnect();

    const { contractId, milestoneIndex } = await req.json();

    //gov only
    const user = req.user;
    if (!user || user.role !== "GOV") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.milestonePlanStatus !== "FINALIZED") {
      return NextResponse.json(
        { error: "Milestones not finalized" },
        { status: 400 }
      );
    }

    const milestone = contract.milestones[milestoneIndex];
    if (!milestone) {
      return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
    }


    if (milestone.status !== "Approved") {
      return NextResponse.json(
        { error: "Milestone not approved" },
        { status: 400 }
      );
    }

    if (milestone.fundRelease.released) {
      return NextResponse.json(
        { message: "Funds already released" },
        { status: 200 }
      );
    }

    const amount = milestone.amount;


    if (
      contract.paidAmount + amount >
      contract.maxPayableAmount
    ) {
      return NextResponse.json(
        { error: "Payment exceeds contract limit" },
        { status: 400 }
      );
    }



    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(
      process.env.SERVER_PRIVATE_KEY,
      provider
    );

    const tx = await wallet.sendTransaction({
      to: contract.blockchain.contractAddress,
      value: ethers.parseEther(String(amount)),
    });

    const receipt = await tx.wait();


    milestone.status = "Paid";
    milestone.fundRelease = {
      released: true,
      transactionHash: receipt.hash,
      releasedAt: new Date(),
    };
    milestone.paidAt = new Date();

    contract.paidAmount += amount;

    // Auto-complete contract
    const allPaid = contract.milestones.every(
      (m) => m.status === "Paid"
    );
    if (allPaid) {
      contract.status = "Completed";
    }

    await contract.save();

    return NextResponse.json({
      message: "Funds released successfully",
      transactionHash: receipt.hash,
    });
  } catch (error) {
    console.error("Fund release error:", error);
    return NextResponse.json(
      { error: "Fund release failed" },
      { status: 500 }
    );
  }
}
