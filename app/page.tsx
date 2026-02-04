"use client";

import { FaceVitalMonitor } from "@/components/face-vital-monitor";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-6">
      <FaceVitalMonitor />
    </main>
  );
}
