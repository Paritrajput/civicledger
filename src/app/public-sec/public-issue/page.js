"use client"
import dynamic from "next/dynamic";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";

const PeopleIssue = dynamic(() => import("@/Components/People/people-issue"), {
  ssr: false,
});

export default function Page() {
  return ProtectedRoute(PeopleIssue);
  // return <PeopleIssue />;
}
