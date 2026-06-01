"use client";
import { createContext, useState, useContext } from "react";
import React from "react";

import { useEffect } from "react";

const GovContext = createContext();

export const GovProvider = ({ children }) => {
  const [govProfile, setGovProfile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSuperOwner, setIsSuperOwner] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

const syncUser = async () => {
  try {
    const res = await fetch("/api/auth/me");

    if (!res.ok) {
      setUser(null);
      return;
    }

    const data = await res.json();

    setUser(data.user);
  } catch (err) {
    console.error("User sync error:", err);
    setUser(null);
  }
};

useEffect(() => {
  const initialize = async () => {
    await syncUser();
    setLoading(false);
  };

  initialize();
}, []);

  return (
    <GovContext.Provider
      value={{
        showPopup,
        setShowPopup,
        user,
        setUser,
        syncUser,       
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
