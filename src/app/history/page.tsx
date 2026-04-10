import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ride History",
  description: "Browse and search completed NEMT ride records.",
};

export default function HistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">Completed Rides</h1>
      <p className="mt-2 text-gray-400">Coming soon</p>
    </div>
  );
}
