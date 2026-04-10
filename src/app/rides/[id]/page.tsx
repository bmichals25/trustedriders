export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white">Ride Detail</h1>
      <p className="mt-2 text-gray-400">Ride ID: {id} — Coming soon</p>
    </div>
  );
}
