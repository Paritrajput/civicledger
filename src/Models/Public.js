import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: {type:String },
    email: { type: String, unique: true , required:true},
    password: {type: String , unique:true, required:true}, 
    profilePic: String,
    authProvider: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },
    is_verified:{
      type:Boolean,
      default:false,
    },

    emailOTP: String,  
    otpExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
