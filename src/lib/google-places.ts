import qs from 'qs';
import config from '../config';

export async function fetchVenueImage(
  name: string,
  lat?: number | null,
  lng?: number | null,
): Promise<string | null> {
  const searchQuery = qs.stringify({
    keyword: name,
    key: config.google_map_api_key,
    ...(lat != null &&
      lng != null && { location: `${lat},${lng}`, radius: 100 }),
  });

  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${searchQuery}`,
  );
  const searchData = await searchRes.json();

  const photoRef = searchData.results?.[0]?.photos?.[0]?.photo_reference;
  if (!photoRef) return null;

  const photoQuery = qs.stringify({
    maxwidth: 800,
    photo_reference: photoRef,
    key: config.google_map_api_key,
  });

  return `https://maps.googleapis.com/maps/api/place/photo?${photoQuery}`;
}
