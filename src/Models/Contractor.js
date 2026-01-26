import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ContractorSchema = new mongoose.Schema(
  {

    name: { type: String, trim: true },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    companyName: {
      type: String,
      index: true,
    },


    experienceYears: {
      type: Number,
      default: 0,
    },

    completedProjects: {
      type: Number,
      default: 0,
    },

    activeProjects: {
      type: Number,
      default: 0,
    },


    contractorRating: {
      average: {
        type: Number,
        default: 0,
        index: true,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    ratings: [RatingSchema],


    isVerifiedByGov: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Government",
    },


    documents: {
      pan: String,
      gst: String,
      license: String,
    },


    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);


ContractorSchema.index(
  { "ratings.userId": 1, "ratings.contractId": 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Contractor ||
  mongoose.model("Contractor", ContractorSchema);
