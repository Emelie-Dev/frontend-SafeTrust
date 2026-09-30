import { notFound } from "next/navigation";
import { getHotelById } from "@/lib/mockData/hotels";
import HotelBookClient from "./HotelBookClient";

export default async function HotelBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = getHotelById(id);
  if (!hotel) notFound();

  return <HotelBookClient hotel={hotel} />;
}
