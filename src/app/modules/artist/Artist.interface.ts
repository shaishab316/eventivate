import type { z } from 'zod';
import type { ArtistValidations } from './Artist.validation';
import type { User as TUser } from '../../../utils/db';
import { TList } from '../query/Query.interface';

/**
 * @type: Invite agent for artist
 */
export type TInviteAgent = z.infer<
  typeof ArtistValidations.inviteAgent
>['body'] & { artist: TUser };

/**
 * @type: Delete agent from artist list
 */
export type TDeleteAgent = z.infer<
  typeof ArtistValidations.deleteAgent
>['body'] & { artist: TUser };

/**
 * @type: Process artist request from agent
 */
export type TProcessArtistRequest = z.infer<
  typeof ArtistValidations.processArtistRequest
>['body'] & { artist: TUser; is_approved: boolean };

/**
 * @type: Get artist list
 */
export type TGetAgentList = TList & {
  agent_ids: string[];
};

/**
 * @type: Search artists
 */
export type TSearchArtistsQuery = z.infer<
  typeof ArtistValidations.searchArtists
>['query'] &
  TList;

export type TSearchArtists = {
  query: TSearchArtistsQuery;
};

export type TSearchArtistsPayload = TSearchArtistsQuery;
