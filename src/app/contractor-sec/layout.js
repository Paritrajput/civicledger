"use client";
import { useGovUser } from "@/Context/govUser";

export default function ContractorLayout({ children }) {
 const { loading } = useGovUser();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Checking credentials...
      </div>
    );
  }

  return children;
}
