import { dbConnect } from "@/lib/dbConnect";
import Public from "@/Models/Public";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
    await dbConnect();
    const {email, otp}=await req.json();

    const user= await Public.findOne({email});
    if(!user){
        return NextResponse.status(400).json({error:"signup failed"},{status:400});
    }
    if(user.otpExpiry < new Date()){
        return NextResponse.status(400).json({error:"OTP Expired"},{status:400});
    }
    const isOTPVallid = await bcrypt.compare(otp, user.emailOTP);
    if(!isOTPVallid){
        return NextResponse.json({error:"invalid OTP"},{status:400});
    }
    user.is_varified=true;
    user.emailOTP=undefined;
    user.otpExpiry=undefined;
    await user.save();

    return NextResponse.json({ message:"Email verfied successfully" }, { status: 200 });

}