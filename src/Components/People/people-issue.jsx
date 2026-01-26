"use client";

import { useState } from "react";
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
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";
import { useNotification } from "@/Context/NotificationContext";

const PeopleIssue = () => {
  const [issueName, setIssueName] = useState("");
  const [description, setDescription] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [position, setPosition] = useState({ lat: 20, lng: 78 });
  const [placeName, setPlaceName] = useState("");
  const [issueImg, setIssueImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

const {warning, success, error}= useNotification();

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
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    return <Marker position={position} icon={customMarker} />;
  }

  function ChangeMapView() {
    const map = useMap();
    map.setView([position.lat, position.lng], 13);
    return null;
  }



  async function fetchPlaceName(lat, lng) {
    try {
      const res = await fetch(
        `/api/geocode/reverse?lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setPlaceName(data.display_name || "Selected Location");
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      setPlaceName("Selected Location");
    }
  }

const handleSearchChange = async (e) => {
  const query = e.target.value;
  setSearchLocation(query);

  if (query.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    const res = await fetch(`/api/geocode/search?q=${query}`);
    const data = await res.json();

    console.log("Geocode suggestions:", data); // 🔍 DEBUG

    setSuggestions(Array.isArray(data) ? data : []);
  } catch (err) {
    setSuggestions([]);
  }
};




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !issueName.trim() ||
      !description.trim() ||
      !position.lat ||
      !position.lng
    ) {
      warning("All fields are required");
      return;
    }


    const token = localStorage.getItem("token");

    if (!token) {
      warning("Authentication required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("issue_type", issueName);
      formData.append("description", description);
      formData.append("placename", placeName);
      formData.append("location", JSON.stringify(position));

      if (issueImg) {
        formData.append("image", issueImg);
      }

      await axios.post("/api/public-issue", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      success("Issue submitted successfully!");

      // reset
      setIssueName("");
      setDescription("");
      setSearchLocation("");
      setSuggestions([]);
      setIssueImg(null);
    } catch (err) {
      console.error("Issue submission failed", err);
      error("Failed to submit issue");
    } finally {
      setLoading(false);
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
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700"
            required
          />

          <textarea
            placeholder="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700"
            required
          />

          {/* Location search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Location *"
              value={searchLocation}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700"
            />

{suggestions.length > 0 && (
  <ul className="absolute z-20 bg-[#0f1224] border border-gray-700 rounded-xl mt-2 w-full max-h-64 overflow-auto z-50">
    {suggestions.map((place, i) => (
      <li
        key={i}
        className="p-3 hover:bg-[#1a1d3a] cursor-pointer"
        onClick={() => {
          setSuggestions([]);
          setSearchLocation(place.display_name);
          setPlaceName(place.display_name);
          setPosition({
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
          });
        }}
      >
        {place.display_name}
      </li>
    ))}
  </ul>
)}

          </div>

          {/* Map */}
          <div className="w-full h-96">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={5}
              className="h-full w-full rounded-xl border border-gray-700"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
              <ChangeMapView />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-400">
            📍 {placeName || "Select a location"} (
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)})
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIssueImg(e.target.files[0])}
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl font-semibold ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-white text-black"
            }`}
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </motion.button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default PeopleIssue;
