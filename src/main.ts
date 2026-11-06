import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // this rejectincoming data not expected in the DTO 
      transform: true, // this automatically convert the payload to the DTO
      transformOptions: {
        enableImplicitConversion: true // allows automatic conversion of primitive types(strings, numbers)
      }
    })
  )

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? "http:localhost:3000",
    Credential: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })

  //Enable Swagger docs
  const config = new DocumentBuilder()
    .setTitle("API Documentaton")
    .setDescription("API document for the application")
    .setVersion("1.0")
    .addTag('auth', 'Authentication related endpoints')
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      name: "JWT",
      bearerFormat: "JWT",
      description: "Access Token",
      in: "header"
    }, 'JWT-auth').addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Refresh Token",
      in: "header"
    }, 'JWT-refresh').addServer('http://localhost:3001', "Developmet server")
    .build()
    ;
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
    customSiteTitle: "API Documentation",
    customfavIcon: "https://nestjs.com/img/logo-small.svg",
    customCss: `
      .swagger-ui .topbar {display:none}
      .swagger-ui .info {margin:50px 0;}
      .swagger-ui .info .title {color: #4A90E2}     
    `
  })
  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `✅ Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
await bootstrap().catch(error => {
  Logger.error('Error starting the server', error);
  process.exit(1);
});
