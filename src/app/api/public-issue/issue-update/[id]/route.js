import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect"; // Ensure you have a database connection file
import Issue from "@/Models/Issue"; // Import the Issue model

// PUT: Update issue status to "reject"
export async function PUT(req, { params }) {
    try {
        await dbConnect();

        const { id } = params;

        // Find the issue and update status
        const updatedIssue = await Issue.findByIdAndUpdate(
            id,
            { status: "GOV_REJECTED" },
            { new: true } 
        );

        if (!updatedIssue) {
            return NextResponse.json({ message: "Issue not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Issue status updated to reject", issue: updatedIssue }, { status: 200 });

    } catch (error) {
        console.error("Error updating issue status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
