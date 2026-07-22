/**
 * Central application configuration loader used by @nestjs/config.
 * Keeps all `process.env` access in one place.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@infnova.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
  },
});
