import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module.js';
import appConfig from './config/app.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      load:[appConfig],
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    PrismaModule,
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
