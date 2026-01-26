import mongoose from "mongoose";

const TenderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, index: true },

    minBidAmount: { type: Number, required: true },
    maxBidAmount: { type: Number, required: true },

    bidOpeningDate: { type: Date, required: true },
    bidClosingDate: { type: Date, required: true },

    location: {
      lat: Number,
      lng: Number,
      placeName: String,
    },

    source: {
      type: String,
      enum: ["ISSUE", "DIRECT"],
      required: true,
    },

    issue: {
      issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
      description: String,
      placeName: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "BIDDING_CLOSED", "AWARDED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

  attachments: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
    blockchain: {
      tenderId: String,
      transactionHash: String,
      network: String,
    },
  },
  { timestamps: true },
);

TenderSchema.index({ bidClosingDate: 1 });
TenderSchema.index({ source: 1 });


export default mongoose.models.Tender ||
  mongoose.model("Tender", TenderSchema);