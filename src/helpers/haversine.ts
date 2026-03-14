import { Prisma } from '../utils/db';

export function haversine(
  lat: number,
  lng: number,
  latCol = 'lat',
  lngCol = 'lng',
): Prisma.Sql {
  return Prisma.sql`
    3958.8 * acos(LEAST(1.0,
      cos(radians(${lat})) * cos(radians(${Prisma.raw(latCol)}))
      * cos(radians(${Prisma.raw(lngCol)}) - radians(${lng}))
      + sin(radians(${lat})) * sin(radians(${Prisma.raw(latCol)}))
    ))
  `;
}
