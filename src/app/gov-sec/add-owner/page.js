"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function Page2() {
  const { ownerId } = useParams();
  const [owners, setOwners] = useState([]);
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [adminRequests, setAdminRequests] = useState([]);

  useEffect(() => {
    if (ownerId) {
      fetchAdminRequests();
    }
  }, [ownerId]);

  const fetchAdminRequests = async () => {
    try {
      const res = await axios.get(`/api/admin-requests?ownerId=${ownerId}`);
      setAdminRequests(res.data);
    } catch (error) {
      console.error("Error fetching admin requests", error);
    }
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/owners", { ...newOwner, addedBy: ownerId });
      alert("Owner added successfully!");
      setNewOwner({ name: "", email: "", password: "" });
    } catch (error) {
      console.error("Error adding owner", error);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-800"
        >
          <h2 className="text-2xl font-semibold mb-6">Add New Owner</h2>
          <form onSubmit={handleAddOwner} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Owner name"
                value={newOwner.name}
                onChange={(e) =>
                  setNewOwner({ ...newOwner, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500 transition"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="owner@example.com"
                value={newOwner.email}
                onChange={(e) =>
                  setNewOwner({ ...newOwner, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500 transition"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={newOwner.password}
                onChange={(e) =>
                  setNewOwner({ ...newOwner, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 text-white rounded-xl focus:outline-none focus:border-gray-500 transition"
                required
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition mt-6"
            >
              Add Owner
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
