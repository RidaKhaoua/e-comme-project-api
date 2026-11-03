export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  backend_url: process.env.BACKEND_URL || 'http://localhost:3000',
});
