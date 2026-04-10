import RideDetailClient from "@/components/RideDetailClient";

// Required for output: export with dynamic segments.
// We pre-render a placeholder; all real ride IDs are handled client-side via useParams.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function RideDetailPage() {
  return <RideDetailClient />;
}
