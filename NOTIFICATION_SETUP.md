# 🔔 Notification System Usage Guide

## Overview

A professional toast notification system with proper UI, animations, and type support.

## Installation ✅

Already integrated in your project! The system is:

- Wrapped in `NotificationProvider` in RootLayout
- Displays notifications via `NotificationContainer` component

---

## Usage

### Basic Usage in Any Component

```jsx
"use client";

import { useNotification } from "@/Context/NotificationContext";

export default function MyComponent() {
  const { success, error, warning, info } = useNotification();

  return (
    <>
      <button onClick={() => success("Operation successful!")}>Success</button>
      <button onClick={() => error("Something went wrong!")}>Error</button>
      <button onClick={() => warning("Be careful with this!")}>Warning</button>
      <button onClick={() => info("Here's some information")}>Info</button>
    </>
  );
}
```

---

## API

### Methods

| Method              | Signature                                  | Example                                     |
| ------------------- | ------------------------------------------ | ------------------------------------------- |
| `success()`         | `success(message, duration?)`              | `success("Saved!")`                         |
| `error()`           | `error(message, duration?)`                | `error("Failed to save")`                   |
| `warning()`         | `warning(message, duration?)`              | `warning("Are you sure?")`                  |
| `info()`            | `info(message, duration?)`                 | `info("Loading...")`                        |
| `addNotification()` | `addNotification(message, type, duration)` | `addNotification("Hello", "success", 3000)` |

### Parameters

- **message** (string): The notification text
- **type** (string): `'success' | 'error' | 'warning' | 'info'` (default: 'info')
- **duration** (number): How long to display in milliseconds (default: 4000)

---

## Examples

### Example 1: Form Submission

```jsx
const handleSubmit = async (data) => {
  try {
    const response = await axios.post("/api/submit", data);
    success("Form submitted successfully!");
  } catch (err) {
    error(err.response?.data?.message || "Failed to submit");
  }
};
```

### Example 2: File Upload

```jsx
const handleUpload = async (file) => {
  if (!file) {
    warning("Please select a file first");
    return;
  }

  try {
    info("Uploading...");
    await uploadFile(file);
    success("File uploaded successfully!");
  } catch (err) {
    error("Upload failed");
  }
};
```

### Example 3: Logout

```jsx
const handleLogout = () => {
  localStorage.removeItem("token");
  success("Logged out successfully");
  router.push("/login");
};
```

### Example 4: Validation

```jsx
const validateForm = (formData) => {
  if (!formData.email) {
    error("Email is required");
    return false;
  }
  if (!formData.password) {
    error("Password is required");
    return false;
  }
  return true;
};
```

---

## Styling

The notifications come with:

- ✅ Gradient backgrounds for each type
- ✅ Smooth animations (slide in/out)
- ✅ Progress bar showing auto-dismiss countdown
- ✅ Icons for each type (CheckCircle, AlertCircle, etc.)
- ✅ Close button for manual dismiss
- ✅ Dark theme matching your app

### Colors

- **Success**: Green gradient
- **Error**: Red gradient
- **Warning**: Yellow/Orange gradient
- **Info**: Blue/Cyan gradient

---

## Features

🎨 **Beautiful UI** - Gradient backgrounds, icons, animations
⏱️ **Auto-dismiss** - Notifications disappear after 4 seconds (customizable)
🚀 **Smooth Animations** - Framer Motion transitions
🔧 **Easy API** - Simple methods for all notification types
📍 **Fixed Position** - Appears in top-right corner
♻️ **Stack Support** - Multiple notifications stack properly
✋ **Manual Control** - Users can close notifications anytime

---

## Configuration

To customize duration globally, modify `NotificationContext.js`:

```jsx
const addNotification = useCallback(
  (message, type = "info", duration = 4000) => {
    // Change 4000 to desired default
    // ...
  },
  [],
);
```

To change position, modify `NotificationContainer.jsx`:

```jsx
<div className="fixed top-6 right-6 z-50">  // Change to top-left, bottom-right, etc.
```

---

## Already Integrated Examples ✅

The Footer component has been updated to use notifications:

```jsx
const { success, error } = useNotification();

const handleSendMessage = () => {
  if (!message.trim()) {
    error("Please write a message"); // ← Beautiful error notification
    return;
  }
  success("Message sent successfully"); // ← Beautiful success notification
  setMessage("");
};
```

---

## Next Steps

1. **Replace all `alert()` calls** with notification system
2. **Use in API calls** for success/error feedback
3. **Use in form validation** for field errors
4. **Use in data mutations** (create, update, delete)

Enjoy your new notification system! 🎉
