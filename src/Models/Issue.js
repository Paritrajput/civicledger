import mongoose from "mongoose";

// const IssueSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId, // Store userId as ObjectId
//     ref: "Public",
//     required: true,
//   },
//   issue_type: { type: String, required: true },
//   description: { type: String, required: true },
//   date_of_complaint: { type: String, required: true },
//   approval: { type: Number, required: true },
//   denial: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ["Pending", "Accepted", "Rejected"],
//     default: "Pending",
//   },
//   image: { type: String, required: false },
//   placename: { type: String, required: false },
//   location: {
//     lat: { type: String, required: true },
//     lng: { type: String, required: true },
//   },
// });



const IssueSchema = new mongoose.Schema(
  {
 
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Public",
      required: true,
      index: true,
    },

  
    issue_type: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String, 
      },
    ],


    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
      placeName: String,
    },


    status: {
      type: String,
      enum: [
        "PENDING_VALIDATION",
        "PUBLIC_VERIFIED",
        "GOV_REJECTED",
        "TENDER_CREATED",
        "IN_PROGRESS",
        "RESOLVED",
      ],
      default: "PENDING_VALIDATION",
      index: true,
    },


    publicValidation: {
      approvals: { type: Number, default: 0 },
      rejections: { type: Number, default: 0 },

      voters: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Public",
          },
          vote: {
            type: String,
            enum: ["APPROVE", "REJECT"],
          },
          weight: {
            type: Number, // reputation-based weight
            default: 1,
          },
          votedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

   
    aiVerification: {
      authenticityScore: {
        type: Number, 
        default: null,
      },
      duplicateScore: {
        type: Number, // similarity with past issues
        default: null,
      },
      severityScore: {
        type: Number,
        default: null,
      },
      verifiedAt: Date,
    },

    governmentReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovUser",
      },
      decision: {
        type: String,
        enum: ["APPROVED", "REJECTED", "NEEDS_SURVEY"],
      },
      remarks: String,
      reviewedAt: Date,
    },


    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

IssueSchema.index({ location: "2dsphere" });

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);


// export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
