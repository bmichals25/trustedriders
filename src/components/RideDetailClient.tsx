"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RideDetailClient() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-8">
      <Link
        href="/rides"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} />
        Back to Active Rides
      </Link>
      <h1 className="text-3xl font-bold text-white">Ride Detail</h1>
      <p className="mt-2 text-gray-400">
        Ride ID: <span className="font-mono text-gray-300">{id}</span> — Coming
        soon
      </p>
    </div>
  );
}
