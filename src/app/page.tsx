"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Memuat peta...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="w-full h-full">
      <MapView />
    </div>
  );
}
