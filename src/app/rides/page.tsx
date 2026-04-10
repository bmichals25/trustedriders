import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active Rides",
  description: "Monitor and manage all active NEMT rides in real time.",
};

export default function RidesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">Active Rides</h1>
      <p className="mt-2 text-gray-400">Coming soon</p>
    </div>
  );
}
