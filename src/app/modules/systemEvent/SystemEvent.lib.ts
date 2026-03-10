import axios from 'axios';
import config from '../../../config';

export const seatGeekClient = axios.create({
  baseURL: 'https://api.seatgeek.com/2',
  timeout: 60_000, //? 1 minute
  headers: { Accept: 'application/json' },
  params: { client_id: config.seatgeek.client_id },
});
