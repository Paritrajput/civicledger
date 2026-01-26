"use client";
import React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { jwtDecode } from "jwt-decode";
import HomePage from "@/Components/Home/page";

export const getDecodedToken = () => {
  try {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) return null;

    const decoded = jwtDecode(token);
    console.log(decoded);
    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};
export default function HomePage1() {
  const router = useRouter();

  useEffect(() => {
    const decoded = getDecodedToken();
    console.log(decoded);

    if (decoded) {
      const role = decoded.role;
      console.log("role:", role);

      if (role === "public") {
        router.push("/");
      } else if (role === "contractor") {
        router.push("/contractor-sec");
      } else if (role === "gov") {
        router.push("/gov-sec");
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, []);

  return <HomePage />;
}

