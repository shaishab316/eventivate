import { Prisma } from '../utils/db';

export function haversine(lat: number, lng: number): Prisma.Sql {
  return Prisma.sql`
    3958.8 * acos(LEAST(1.0,
      cos(radians(${lat})) * cos(radians(lat))
      * cos(radians(lng) - radians(${lng}))
      + sin(radians(${lat})) * sin(radians(lat))
    ))
  `;
}
