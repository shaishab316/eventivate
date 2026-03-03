export default {
  port: Number(process.env.PORT ?? 3000),
  database: {
    database_url: String(process.env.DATABASE_URL),
    database_url_unpooled: String(process.env.DATABASE_URL_UNPOOLED),
  },
  encryption_key: String(process.env.ENCRYPTION_KEY),
  jwt_secret: String(process.env.JWT_SECRET),
  mail: {
    host: String(process.env.MAIL_HOST),
    port: Number(process.env.MAIL_PORT),
    user: String(process.env.MAIL_USER),
    pass: String(process.env.MAIL_PASS),
  },
  server_url: String(process.env.SERVER_URL),
  otp_key: String(process.env.OTP_KEY),
};
