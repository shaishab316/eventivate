import axios from 'axios';
import qs from 'qs';
import config from '../../../config';

export const seatGeekClient = axios.create({
  baseURL: 'https://api.seatgeek.com/2',
  timeout: 60_000,
  headers: { Accept: 'application/json' },
  auth: {
    username: config.seatgeek.client_id,
    password: config.seatgeek.client_secret,
  },
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
});
