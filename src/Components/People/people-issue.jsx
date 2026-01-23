"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";
import { useGovUser } from "@/Context/govUser";

const PeopleIssue = () => {
  const [issueName, setIssueName] = useState("");
  const [description, setDescription] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [position, setPosition] = useState({ lat: 20, lng: 78 });
  const [placeName, setPlaceName] = useState("");
  const [issueImg, setIssueImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [dateOfComplaint, setDateOfComplaint] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [userId, setUserId] = useState();
  const { user } = useGovUser();

  useEffect(() => {
    setUserId(user.id);
  }, [user]);

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     if (typeof window === "undefined") return;

  //     const token = localStorage.getItem("public-token");
  //     if (token) {
  //       try {
  //         const res = await axios.get("/api/public-sec/profile", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });
  //         setPublicId(res.data._id);
  //       } catch (err) {
  //         localStorage.removeItem("public-token");
  //       }
  //     }
  //   };

  //   fetchProfile();
  // }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        fetchPlaceName(lat, lng);
      },
    });
    const customMarker = new L.Icon({
      iconUrl:
        "https://img.icons8.com/?size=100&id=84891&format=png&color=000000",
      // iconRetinaUrl:  "https://img.icons8.com/?size=100&id=84891&format=png&color=000000",
      // shadowUrl:  "https://img.icons8.com/?size=100&id=7880&format=png&color=000000",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    return <Marker position={position} icon={customMarker} />;
  }

  async function fetchPlaceName(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      setPlaceName(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Error fetching place name:", error);
    }
  }

  async function handleSearchLocation() {
    if (!searchLocation) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchLocation}`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setPlaceName(data[0].display_name);
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  }

  function ChangeMapView() {
    const map = useMap();
    map.setView([position.lat, position.lng], 13);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueName || !description || !placeName) {
      return alert("All fields are required!");
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("issue_type", issueName);
      formData.append("description", description);
      formData.append("approval", 0);
      formData.append("denial", 0);
      formData.append("location", JSON.stringify(position)); // Fixed this line
      formData.append("placename", placeName);
      formData.append("status", "Pending");
      formData.append("date_of_complaint", dateOfComplaint);
      if (issueImg) formData.append("image", issueImg);

      await axios.post("/api/public-issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Issue submitted successfully!");
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchLocation(query);
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
      );
      const data = await res.json();
      setSuggestions(data.map((place) => place.display_name));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 text-white shadow-lg rounded-2xl my-5">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          Raise a Public Issue
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Issue Name *"
            value={issueName}
            onChange={(e) => setIssueName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
            required
          />
          <textarea
            placeholder="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
            required
          ></textarea>
          <div className="flex gap-2 relative">
            <input
              type="text"
              placeholder="Search Location *"
              value={searchLocation}
              onChange={handleSearchChange}
              className="flex-1 px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-20 bg-[#0f1224] text-white border border-gray-700 rounded-xl mt-12 w-full md:max-h-96 max-h-64 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="p-3 hover:bg-[#1a1d3a] cursor-pointer transition"
                    onClick={() => {
                      setSearchLocation(s);
                      setSuggestions([]);
                      handleSearchLocation();
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSearchLocation}
              className="bg-white text-black px-6 py-3 rounded-xl font-semibold transition"
            >
              Search
            </motion.button>
          </div>
          <div className="w-full h-96 mt-2 z-[10]">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={5}
              className="h-full w-full z-[10] rounded-xl border border-gray-700"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
              <ChangeMapView />
            </MapContainer>
          </div>
          <div className="mt-4 p-4 bg-[#0f1224] rounded-xl border border-gray-700">
            <p className="text-gray-300">
              <strong>Selected Location:</strong> {placeName}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              <strong>Coordinates:</strong> {position.lat.toFixed(4)},{" "}
              {position.lng.toFixed(4)}
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIssueImg(e.target.files[0])}
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition file:bg-white file:text-black file:px-3 file:py-1 file:rounded-lg file:border-0 file:cursor-pointer"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`w-full px-4 py-3 rounded-xl transition font-semibold ${
              loading
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-white text-black hover:shadow-lg"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </motion.button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default PeopleIssue;
