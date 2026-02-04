import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FaceVital - Health Monitoring",
  description:
    "Advanced PPG-based health monitoring using your face. Monitor heart rate, breathing, blood pressure, and more.",
  keywords: "health monitoring, heart rate, PPG, face detection, wellness",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/vision_bundle.js" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
