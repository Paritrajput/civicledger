import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/Components/Navbar/navbar";
import Footer from "@/Components/Footer/footer";

import SessionWrapper from "@/lib/sessionWrapper";
import { GovProvider } from "@/Context/govUser";
import { NotificationProvider } from "@/Context/NotificationContext";
import NotificationContainer from "@/Components/Notification/NotificationContainer";
import Profile from "@/Components/UserProfile/profile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CivicLedger",
  description: "A Blockchain Powered Website",
};

export default function RootLayout({ children }) {
  return (
    <GovProvider>
      <NotificationProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <SessionWrapper>
              <NotificationContainer />
              <Navbar />
              <Profile />
              {children}
              <Footer />
            </SessionWrapper>
          </body>
        </html>
      </NotificationProvider>
    </GovProvider>
  );
}
