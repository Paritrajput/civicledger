import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePic: String,

    authProvider: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },

    is_verified: {
      type: Boolean,
      default: false,
    },


    location: {
      lat: { type: Number },
      lng: { type: Number },
      placeName: String,
    },


    reputation: {
      score: { type: Number, default: 50 },
      totalVotes: { type: Number, default: 0 },
      correctVotes: { type: Number, default: 0 },
    },


    emailOTP: String,
    otpExpiry: Date,


    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
