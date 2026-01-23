"use client";

import { createContext, useState, useCallback, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remove notification after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => addNotification(message, "success", duration),
    [addNotification],
  );

  const error = useCallback(
    (message, duration) => addNotification(message, "error", duration),
    [addNotification],
  );

  const warning = useCallback(
    (message, duration) => addNotification(message, "warning", duration),
    [addNotification],
  );

  const info = useCallback(
    (message, duration) => addNotification(message, "info", duration),
    [addNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
