import mongoose from "mongoose";

// const GovernmentSchema = new mongoose.Schema({
//   name: String,
//   postion: String,
//   email: { type: String, unique: true },
//   password: String,
//   isVerified: Boolean,
//   verifiedBy: String,
// });

// export default mongoose.models.Government ||
//   mongoose.model("Government", GovernmentSchema);
// import mongoose from "mongoose";

const GovernmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    position: {
      type: String,
      required: true,
    },

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

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner", 
    },


    // permissions: {
    //   canCreateTender: { type: Boolean, default: false },
    //   canApproveTender: { type: Boolean, default: false },
    //   canReleaseFunds: { type: Boolean, default: false },
    //   canVerifyContractors: { type: Boolean, default: false },
    // },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Government ||
  mongoose.model("Government", GovernmentSchema);
