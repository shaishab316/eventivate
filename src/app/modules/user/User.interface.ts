import type z from 'zod';
import type { UserValidations } from './User.validation';
import type { User as TUser } from '../../../utils/db';

export type TUserRegister = z.infer<
  typeof UserValidations.userRegister
>['body'];

export type TUserEditBody = z.infer<typeof UserValidations.editProfile>['body'];

export type TUserSuperEditBody = z.infer<
  typeof UserValidations.superEditProfile
>['body'];

export type TUserEditArgs = {
  user: Partial<TUser>;
  body: TUserSuperEditBody | TUserEditBody;
};

export type TUserSuperEdit = {
  body: TUserSuperEditBody;
  params: { userId: string };
};

export type TAgentRegister = z.infer<
  typeof UserValidations.agentRegister
>['body'];

export type TVenueRegister = z.infer<
  typeof UserValidations.venueRegister
>['body'];

export type TArtistRegister = z.infer<
  typeof UserValidations.artistRegister
>['body'];

export type TOrganizerRegister = z.infer<
  typeof UserValidations.organizerRegister
>['body'];

export type TUpdateAvailability = z.infer<
  typeof UserValidations.updateAvailability
>['body'] & { user_id: string };

export type TTourManagerRegister = z.infer<
  typeof UserValidations.tourManagerRegister
>['body'];
