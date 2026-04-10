import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of active rides, drivers, and chaperones.",
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-gray-400">Coming soon</p>
    </div>
  );
}
