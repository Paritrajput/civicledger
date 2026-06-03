// export default function PublicSecLayout({ children }) {
//   return <>{children}</>;
// }
"use client";
import { useGovUser } from "@/Context/govUser";
import Loader from "@/Components/ui/Loader";

export default function GovLayout({ children }) {
  const { loading } = useGovUser();

  if (loading) {
    return (
<Loader />
    );
  }

  return children;
}