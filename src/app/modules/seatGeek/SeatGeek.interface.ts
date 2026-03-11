export interface SGCoords {
  lat: number;
  lon: number;
}

export interface SGImages {
  huge: string;
  large?: string;
  medium?: string;
  small?: string;
}

export interface SGTaxonomy {
  id: number;
  name: string;
  parent_id: string | null;
  seo_event_type?: string;
  rank?: number;
}

export interface SGGenre {
  id: number;
  name: string;
  slug: string;
  image: string;
  images: SGImages;
  primary: boolean;
}

export interface SGLink {
  id: string;
  url: string;
  provider: 'vividseats' | 'ticketmaster' | 'stubhub' | string;
  primary: boolean;
  display_name: string;
  logos: Record<string, unknown>;
  sales: unknown[];
  link_type: 'ID' | string;
}

export interface SGIntegrated {
  provider_id: string;
  provider_name: string;
}

export interface SGPerformerStats {
  event_count: number;
}

export interface SGPerformer {
  id: number;
  name: string;
  short_name: string;
  slug: string;
  type: 'band' | 'team' | 'theater' | string;
  url: string;
  relative_url?: string;
  image: string;
  images: SGImages;
  score: number;
  popularity?: number;
  primary: boolean;
  is_event?: boolean;
  has_upcoming_events?: boolean;
  num_upcoming_events?: number;
  home_venue_id?: number | null;
  location?: SGCoords | null;
  colors?: string[] | null;
  divisions?: unknown | null;
  links?: SGLink[];
  stats?: SGPerformerStats;
  taxonomies?: SGTaxonomy[];
  genres?: SGGenre[];
  image_attribution?: string;
  image_license?: string;
  image_rights_message?: string;
  ada_dominant_image_color?: string;
}

export interface SGPerformerOrder {
  id: number;
  ordinal: number;
}

export interface SGVenuePassStats {
  event_count: number;
}

export interface SGVenuePass {
  pass_type: 'PARKING' | string;
  name: string;
  url: string;
  relative_url: string;
  stats: SGVenuePassStats;
  image_rights_message: string;
}

export interface SGVenue {
  id: number;
  name: string;
  name_v2?: string;
  slug?: string;
  url: string;
  relative_url?: string;
  address: string;
  extended_address: string;
  display_location?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  timezone?: string;
  metro_code?: number;
  sg_market_area?: number | null;
  marquee_city?: string | null;
  capacity?: number;
  score: number;
  popularity?: number;
  location: SGCoords;
  access_method?: string | null;
  has_upcoming_events?: boolean;
  num_upcoming_events?: number;
  links?: SGLink[];
  passes?: SGVenuePass[];
}

export interface SGEventStats {
  listing_count?: number;
  average_price?: number;
  lowest_price?: number;
  highest_price?: number;
}

export type SGEventType = 'concert' | 'sports' | 'theater' | string;
export type SGEventStatus = 'normal' | 'cancelled' | 'postponed' | string;
export type SGVisibleOverride = 'UNSET' | 'VISIBLE' | 'HIDDEN' | string;

export interface SGEvent {
  id: number;
  title: string;
  short_title: string;
  type: SGEventType;
  status?: SGEventStatus;
  description?: string;
  url: string;
  relative_url?: string;
  score: number;
  popularity?: number;
  announce_date: string;
  created_at?: string;
  datetime_local: string;
  datetime_utc: string;
  enddatetime_utc?: string | null;
  visible_until?: string;
  visible_until_utc?: string;
  visible_at?: string;
  date_tbd: boolean;
  time_tbd: boolean;
  /** @deprecated use date_tbd / time_tbd */
  datetime_tbd?: boolean;
  performers: SGPerformer[];
  performer_order?: SGPerformerOrder[];
  venue: SGVenue;
  links?: SGLink[];
  taxonomies: SGTaxonomy[];
  stats?: SGEventStats;
  integrated: SGIntegrated | null;
  access_method?: string | null;
  announcements?: Record<string, unknown>;
  event_promotion?: string | null;
  game_number?: number;
  home_game_number?: number;
  main_event_id?: number | null;
  onsale?: string | null;
  playoffs?: string | null;
  season_stage?: string | null;
  is_open?: boolean;
  is_visible?: boolean;
  is_visible_override?: SGVisibleOverride;
  conditional?: boolean;
  contingent?: boolean;
  ticketmaster?: unknown | null;
  tdc_pv_id?: number;
  tdc_pvo_id?: number;
  themes?: unknown[];
  domain_information?: unknown[];
  event_group_ids?: unknown[];
  open_domain_id?: string;
  open_id?: string;
}

export interface SGGeolocation {
  lat: number;
  lon: number;
  range: string;
}

export interface SGMeta {
  geolocation: SGGeolocation | null;
  total: number;
  took: number;
  page: number;
  per_page: number;
}

export interface SGEventsResponse {
  events: SGEvent[];
  meta: SGMeta;
}
