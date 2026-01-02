import axios from 'axios';
import { TFacebookUser, TGoogleUser } from './Auth.interface';

export const facebookUser = async (token: string): Promise<TFacebookUser> =>
  (
    await axios.get(
      `https://graph.facebook.com/me?access_token=${token}&fields=name,email,picture.width(300).height(300)`,
    )
  ).data;

export const googleUser = async (token: string): Promise<TGoogleUser> =>
  (
    await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
    )
  ).data;
