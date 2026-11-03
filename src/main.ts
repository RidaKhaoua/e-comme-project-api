import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `✅ Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
await bootstrap().catch(error => {
  Logger.error('Error starting the server', error);
  process.exit(1);
});
