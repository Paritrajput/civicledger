import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  emailOTP: {
    type: String,
    required: true,
  },

  lastOtpSentAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },
});

export default mongoose.models.PendingUser ||
  mongoose.model("PendingUser", pendingUserSchema);