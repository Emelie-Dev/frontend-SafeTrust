import { notFound } from "next/navigation";
import { getHotelById, getSuggestedHotels } from "@/lib/mockData/hotels";
import RentalDetail from "./RentalDetail";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apartment = getHotelById(id);
  if (!apartment) notFound();
  const suggestions = getSuggestedHotels(id);

  return <RentalDetail apartment={apartment} suggestions={suggestions} />;
}
