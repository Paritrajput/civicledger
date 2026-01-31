"use client";

import Link from "next/link";

export default function Verification() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 flex flex-col gap-3">
        <span className="">
        Your verification request has been sent to the owner! You’ll receive an email once the owner approves your request. Once verified, you’ll be able to log in and access your account. 
        </span>
        <Link href="/" className="text-red-600">Go to home</Link>
      </div>
    </div>
  );
}
