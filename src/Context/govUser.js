"use client";
import { createContext, useState, useContext } from "react";
import React from "react";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const GovContext = createContext();

export const GovProvider = ({ children }) => {
  const [govProfile, setGovProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSuperOwner, setIsSuperOwner] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncUser = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Token decode error:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    setLoading(false);
  }, []);

  return (
    <GovContext.Provider
      value={{
        showPopup,
        setShowPopup,
        user,
        setUser,
        syncUser,        // 👈 ADD THIS
        govProfile,
        setGovProfile,
        isOwner,
        setIsOwner,
        isSuperOwner,
        setIsSuperOwner,
        loading,
      }}
    >
      {children}
    </GovContext.Provider>
  );
};


export const useGovUser = () => useContext(GovContext);
