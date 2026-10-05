import RentalDetail from "./RentalDetail";
import {
  getApartmentById,
  getSuggestedApartments,
} from "@/lib/mockData/apartmentListings";

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apartment = getApartmentById(id);
  const suggestions = getSuggestedApartments(apartment.id);

  return <RentalDetail apartment={apartment} suggestions={suggestions} />;
}
