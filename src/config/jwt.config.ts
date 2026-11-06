export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN)
      : 900, // 15 minutes
  },
});
