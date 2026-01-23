import React from "react";

function page() {
  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-300">No Messages till yet</p>
      </div>
    </div>
  );
}

export default page;
