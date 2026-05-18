import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "BarangayLink",
    template: "%s | BarangayLink",
  },
  description:
    "Community utility portal for Barangay San Isidro — waste tracking, announcements, and emergency contacts.",
  keywords: ["barangay", "community", "waste tracker", "announcements", "Philippines"],
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,         // prevent double-tap zoom on mobile forms
  userScalable: false,
  themeColor: "#1d60ed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}
