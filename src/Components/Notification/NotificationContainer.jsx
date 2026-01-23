"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/Context/NotificationContext";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getStyles = (type) => {
    const styles = {
      success: {
        bg: "bg-gradient-to-r from-green-500 to-emerald-600",
        icon: CheckCircle,
        iconColor: "text-green-100",
      },
      error: {
        bg: "bg-gradient-to-r from-red-500 to-rose-600",
        icon: AlertCircle,
        iconColor: "text-red-100",
      },
      warning: {
        bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
        icon: AlertTriangle,
        iconColor: "text-yellow-100",
      },
      info: {
        bg: "bg-gradient-to-r from-blue-500 to-cyan-600",
        icon: Info,
        iconColor: "text-blue-100",
      },
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="fixed top-20 z-50 left-1/2 -translate-x-1/2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const styles = getStyles(notification.type);
          const Icon = styles.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 100 }}
              transition={{ duration: 0.3 }}
              className={`${styles.bg} text-white rounded-2xl shadow-2xl p-4 mb-4 flex items-center gap-3 max-w-md pointer-events-auto min-w-72 backdrop-blur-sm`}
            >
              <Icon className={`${styles.iconColor} flex-shrink-0 h-6 w-6`} />

              <div className="flex-1">
                <p className="font-medium text-sm">{notification.message}</p>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-white hover:opacity-75 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: notification.duration / 1000 }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
