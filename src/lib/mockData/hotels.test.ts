import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  HOTEL_CATEGORIES,
  HOTEL_LOCATIONS,
  getHotelById,
  STUB_HOTELS,
} from './hotels';

describe('STUB_HOTELS', () => {
  it('contains unique listing IDs and unique lead photos', () => {
    expect(new Set(STUB_HOTELS.map((hotel) => hotel.id)).size).toBe(
      STUB_HOTELS.length,
    );
    expect(new Set(STUB_HOTELS.map((hotel) => hotel.images[0])).size).toBe(
      STUB_HOTELS.length,
    );
  });

  it('covers every location and category with complete local photo sets', () => {
    expect(new Set(STUB_HOTELS.map((hotel) => hotel.location))).toEqual(
      new Set(HOTEL_LOCATIONS),
    );
    expect(new Set(STUB_HOTELS.map((hotel) => hotel.category))).toEqual(
      new Set(HOTEL_CATEGORIES),
    );

    for (const hotel of STUB_HOTELS) {
      expect(new Set(hotel.images).size).toBe(4);
      expect(hotel.description.trim().split(/[.!?]+/).filter(Boolean).length).toBeGreaterThanOrEqual(2);
      for (const image of hotel.images) {
        expect(existsSync(path.join('public', image))).toBe(true);
      }
      expect(existsSync(path.join('public', hotel.owner.avatar))).toBe(true);
    }
  });

  it('returns undefined for unknown IDs', () => {
    expect(getHotelById('not-a-listing')).toBeUndefined();
  });
});