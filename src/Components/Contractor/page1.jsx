"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender", {
          signal: controller.signal,
        });

        setTenders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Could not get tenders", err);
          setError("Could not get tenders");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">
        Active Tenders
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-3xl">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : tenders.length === 0 ? (
          <p className="text-gray-400 text-center">
            No tenders available
          </p>
        ) : (
          tenders.map((item) => (
            <CardComponent
              key={item._id || item.id}
              title={item?.title}
              content={item?.description}
              timeOfComplition={item?.bidClosingDate}
              onClick={() =>
                router.push(
                  `/contractor-sec/tender-desc?tenderId=${item._id || item.id}`
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function CardComponent({ title, content, timeOfComplition, onClick }) {
  return (
    <div
      className="bg-gray-900 p-4 rounded-lg shadow-lg mb-4 cursor-pointer transition-transform transform hover:scale-105 hover:bg-gray-800 border border-gray-700"
      onClick={onClick}
    >
      <p className="text-green-400 text-xl font-semibold">
        {title || "Untitled Tender"}
      </p>

      <h2 className="font-medium text-white">
        {content || "No description available"}
      </h2>

      <span className="flex items-center gap-1">
        <p className="font-normal text-lg text-green-400">
          Last date for bid submission:
        </p>
        <p className="text-white font-medium">
          {timeOfComplition || "N/A"}
        </p>
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
    </div>
  );
}
