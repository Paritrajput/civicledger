"use client";
import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="flex flex-col items-center gap-6">
        
        {/* Animated Ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>

        {/* Text */}
        <p className="text-white text-lg tracking-wide animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}