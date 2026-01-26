import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      required: true,
      index: true,
    },

    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
      index: true,
    },

   
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    proposalDocument: {
      type: String, 
      required: true,
    },

    timeline: {
      type: String, 
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    contractorRating: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: null,
      index: true,
    },

    evaluation: {
      systemRecommended: {
        type: Boolean,
        default: false,
      },
      evaluatedAt: {
        type: Date,
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "SYSTEM_RECOMMENDED",
        "Accepted",
        "Rejected",
      ],
      default: "Pending",
      index: true,
    },

    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

BidSchema.index(
  { tenderId: 1, contractorId: 1 },
  { unique: true }
);

export default mongoose.models.Bid ||
  mongoose.model("Bid", BidSchema);
