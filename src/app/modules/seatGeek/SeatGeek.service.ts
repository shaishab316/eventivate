import { SystemEventServices } from '../systemEvent/SystemEvent.service';
import { SystemPerformerServices } from '../systemPerformer/SystemPerformer.service';
import { SystemVenueServices } from '../systemVenue/SystemVenue.service';
import type { SGEventsResponse } from './SeatGeek.interface';
import { seatGeekClient } from './SeatGeek.lib';

export const SeatGeekServices = {
  async mineEventFromSeatGeek(
    reqOptions: { taxonomies?: Array<{ name: string }>; [key: string]: any },
    page = 1,
    per_page = 100,
  ) {
    const params: Record<string, any> = { page, per_page, ...reqOptions };

    if (reqOptions.taxonomies?.length) {
      params['taxonomies.name'] = reqOptions.taxonomies.map(t => t.name);
      delete params.taxonomies;
    }

    const { data } = await seatGeekClient.get<SGEventsResponse>('/events', {
      params,
    });
    return data;
  },

  async processEventData({ events }: SGEventsResponse) {
    for (const eventSG of events) {
      console.log(`Processing event: ${eventSG.title} (ID: ${eventSG.id})`);

      const venue = await SystemVenueServices.createORUpdateSystemVenue({
        name: eventSG.venue.name,

        address: eventSG.venue.address,
        city: eventSG.venue.city,
        state: eventSG.venue.state,
        country: eventSG.venue.country,
        zip: eventSG.venue.postal_code,
        latitude: eventSG.venue.location.lat,
        longitude: eventSG.venue.location.lon,

        source: 'seatgeek',
        source_id: eventSG.venue.id.toString(),
        source_url: eventSG.venue.url,

        capacity: eventSG.venue.capacity,
        score: eventSG.venue.score,
      });

      const event = await SystemEventServices.createOrUpdateSystemEvent({
        venue_id: venue.id,
        name: eventSG.title,

        address: eventSG.venue.address,
        city: eventSG.venue.city,
        state: eventSG.venue.state,
        zip: eventSG.venue.postal_code,
        country: eventSG.venue.country,
        latitude: eventSG.venue.location.lat,
        longitude: eventSG.venue.location.lon,

        source: 'seatgeek',
        source_id: eventSG.id.toString(),
        source_url: eventSG.url,
      });

      console.log(
        `Created/Updated event: ${event.name} (ID: ${event.id}) at venue: ${venue.name} (ID: ${venue.id})`,
      );

      for (const performerSG of eventSG.performers) {
        console.log(
          `Processing performer: ${performerSG.name} (ID: ${performerSG.id}) for event: ${event.name} (ID: ${event.id})`,
        );

        const performer =
          await SystemPerformerServices.createOrUpdateSystemPerformer({
            name: performerSG.name,
            source: 'seatgeek',
            source_id: performerSG.id.toString(),
            source_url: performerSG.url,
            image: performerSG.images.huge ?? performerSG.image,
            score: performerSG.score,

            event_id: event.id, //? connect performer to event in the same step
          });

        if (performerSG.genres?.length) {
          for (const genreSG of performerSG.genres) {
            console.log(
              `Processing genre: ${genreSG.name} for performer: ${performer.name} (ID: ${performer.id})`,
            );

            const genre =
              await SystemPerformerServices.createOrUpdateSystemGenre({
                name: genreSG.name,
                source: 'seatgeek',
                source_id: genreSG.id.toString(),
                image: genreSG.images.huge ?? genreSG.image,
                slug: genreSG.slug,
              });

            await SystemPerformerServices.createOrGetSystemPerformerGenre({
              performer_id: performer.id,
              genre_id: genre.id,
            });
          }
        }
      }
    }
  },
};
