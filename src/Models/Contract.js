import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    role: {
      type: String,
      enum: ["Citizen", "GovOfficial"],
    },

    vote: {
      type: String,
      enum: ["Approve", "Reject"],
    },

    comment: String,

    weight: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

const ProofSchema = new mongoose.Schema(
  {
    fileUrl: String,
    type: {
      type: String,
      enum: ["Image", "Document", "Video"],
    },
    geoLocation: {
      lat: Number,
      lng: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
    },
  },
  { timestamps: true },
);

const PublicVoteSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    vote: {
      type: String,
      enum: ["approve", "reject"],
    },
    comment: String,
    attachment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const MilestoneSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,

    gracePeriodDays: {
      type: Number,
      default: 7,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "InProgress",
        "Submitted",
        "UnderReview",
        "GovReview",
        "Approved",
        "Rejected",
        "Paid",
        "Overdue",
      ],
      default: "Pending",
    },

    proofs: {
      type: [ProofSchema],
      default: [],
    },

    delay: {
      reason: String,
      submittedAt: Date,
      approvedByGov: Boolean,
    },

    aiVerification: {
      score: Number,
      remarks: String,
    },

    publicVotes: {
      approve: { type: Number, default: 0 },
      reject: { type: Number, default: 0 },
    },

    publicVotesLog: {
      type: [PublicVoteSchema],
      default: [],
    },
    publicVoting: {
      opensAt: Date,
      closesAt: Date,
      closed: {
        type: Boolean,
        default: false,
      },
    },

    submittedAt: Date,
    finalEvaluation: {
      aiScore: Number, // 0–100
      publicScore: Number, // 0–100
      govScore: Number, // 0–100
      finalScore: Number, // 0–100

      recommended: {
        type: Boolean,
        default: false,
      },

      calculatedAt: Date,

      overridden: {
        type: Boolean,
        default: false,
      },
      overrideReason: String,
    },

    fundRelease: {
      released: Boolean,
      releasedAt: Date,
    },
  },
  { timestamps: true },
);

const LocationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    placeName: String,
  },
  { _id: false },
);

const ContractSchema = new mongoose.Schema(
  {
    contractId: { type: String, unique: true },

    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      required: true,
    },

    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },

    contractValue: Number,
    maxPayableAmount: Number,

    paidAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Suspended", "Completed", "Terminated"],
      default: "Active",
    },

    awardMeta: {
      selectionType: {
        type: String,
        enum: ["SYSTEM", "MANUAL"],
        required: true,
      },
      manualReason: {
        type: String,
        trim: true,
      },
      awardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      awardedAt: {
        type: Date,
        default: Date.now,
      },
    },

    timeline: {
      startedAt: Date,
      expectedCompletionAt: Date,
      completedAt: Date,
    },

    milestonePlanStatus: {
      type: String,
      enum: [
        "DRAFT",
        "CONTRACTOR_REVIEW",
        "CONTRACTOR_PROPOSED",
        "GOV_REVIEW",
        "FINALIZED",
      ],
      default: "DRAFT",
    },

    proposedMilestones: [
      {
        title: String,
        description: String,
        amount: Number,
        dueDate: Date,
        gracePeriodDays:Number
      },
    ],

    proposalReason: String,

    negotiationRound: {
      type: Number,
      default: 0,
      max: 2,
    },

    milestones: [MilestoneSchema],

    actionHistory: [
      {
        action: {
          type: String,
          enum: ["SUSPENDED", "RESUMED", "TERMINATED"],
        },
        reason: String,
        actedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Government",
        },
        actedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    blockchain: {
      contractAddress: String,
      transactionHash: String,
      network: String,
    },

    location: LocationSchema,
  },
  { timestamps: true },
);

ContractSchema.index({ tenderId: 1 });
ContractSchema.index({ contractor: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ milestonePlanStatus: 1 });

export default mongoose.models.Contract ||
  mongoose.model("Contract", ContractSchema);
