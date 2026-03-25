import { Router } from 'express';
import { SeatGeekServices } from '../seatGeek/SeatGeek.service';

const router = Router();

router.get('/', async (req, res) => {
  const data = await SeatGeekServices.fetchSeatGeekEvents(
    {
      // taxonomies: [{ name: 'concert' }, { name: 'concerts' }],
    },
    1,
    5,
  );

  console.log('Data retrieved from SeatGeek:', data);

  res.json(data);
});

export const SystemEventRoutes = router;
