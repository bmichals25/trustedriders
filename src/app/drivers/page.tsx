import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drivers",
  description: "Manage driver profiles, availability, and assignments.",
};

export default function DriversPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">Driver Management</h1>
      <p className="mt-2 text-gray-400">Coming soon</p>
    </div>
  );
}
