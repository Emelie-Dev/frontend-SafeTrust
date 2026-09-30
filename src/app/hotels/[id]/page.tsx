import { notFound } from "next/navigation";
import { getHotelById } from "@/lib/mockData/hotels";
import HotelDetailClient from "./HotelDetailClient";

export default async function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = getHotelById(id);
  if (!hotel) notFound();

  return <HotelDetailClient hotel={hotel} />;
}
