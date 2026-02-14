import type { z } from 'zod';
import type { OfferpostValidations } from './Offerpost.validation';
import type { EUserRole } from '../../../utils/db';
import type { TList } from '../query/Query.interface';

export type TCreateGig = z.infer<typeof OfferpostValidations.createGig>;

export type TCreateGigPayload = TCreateGig['body'] & {
  owner_id: string;
  owner_role: EUserRole;
};

export type TUpdateGig = z.infer<typeof OfferpostValidations.updateGig>;

export type TUpdateGigPayload = TUpdateGig['body'] & {
  user_id: string;
};

export type TDeleteGig = z.infer<typeof OfferpostValidations.deleteGig>;

export type TDeleteGigPayload = TDeleteGig['body'] & {
  user_id: string;
};

export type TGetMyGigs = {
  query: TList;
};

export type TGetMyGigsPayload = TGetMyGigs['query'] & {
  user_id: string;
};

export type TSearchOtherGigsQuery = z.infer<
  typeof OfferpostValidations.searchOtherGigs
>['query'] &
  TList;

export type TSearchOtherGigs = {
  query: TSearchOtherGigsQuery;
};

export type TSearchOtherGigsPayload = TSearchOtherGigs['query'] & {
  user_id: string;
};

export type TGigWithDistance = {
  id: string;
  created_at: Date;
  updated_at: Date;
  owner_id: string;
  owner_role: string;
  genre: string | null;
  title: string;
  description: string;
  banner_url: string | null;
  keywords: string[];
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  budget_min: number;
  budget_max: number;
  target_for_agents: boolean;
  target_for_artists: boolean;
  target_for_venues: boolean;
  target_for_organizers: boolean;
  target_for_managers: boolean;
  is_active: boolean;
  distance_km?: number;
};

export type TRequestGig = z.infer<typeof OfferpostValidations.requestGig>;

export type TRequestGigPayload = TRequestGig['body'] & {
  user_id: string;
};

export type TGetSendGigRequestsQuery = z.infer<
  typeof OfferpostValidations.getSendGigRequests
>['query'] &
  TList;

export type TGetSendGigRequests = {
  query: TGetSendGigRequestsQuery;
};

export type TGetSendGigRequestsPayload = TGetSendGigRequests['query'] & {
  user_id: string;
};
