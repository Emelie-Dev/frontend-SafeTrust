import { STUB_HOTELS } from "@/lib/mockData/hotels";

export const hotelsMockData = STUB_HOTELS.map((hotel) => ({
  id: hotel.id,
  name: hotel.name,
  image: hotel.images[0],
  location: hotel.address,
  stars: hotel.rating,
  price: hotel.price,
  isFavorite: Boolean(hotel.favorite),
}));
