"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGovUser } from "@/Context/govUser";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useGovUser();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Only check after loading is done
    if (!loading) {
      if (user && user.role === 'public') {
        setIsVerified(true);
      } else {
        router.push("/authenticate/public-auth/login");
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Avoid flicker before user is verified
  if (!isVerified) return null;

  return children;
}
