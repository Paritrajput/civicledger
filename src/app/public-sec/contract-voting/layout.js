"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGovUser } from "@/Context/govUser";

export default function ContractVotingLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, loading } = useGovUser();

  useEffect(() => {
    if (!loading) {
      if (user?.role === "public") {
        setIsAuthenticated(true);
      } else {
        router.push("/authenticate/public-auth/login");
      }
    }
  }, [user, loading]);

  if (loading) {
    return <div className="text-white p-14">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
