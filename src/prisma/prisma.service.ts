import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const directUrl = configService.getOrThrow<string>('DATABASE_URL');

    const adapter = new PrismaPg({
      connectionString: directUrl,
    });
    super({
      adapter,
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from the database');
  }

  async cleanDatabase() {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new Error('Cannot clear database in production');
    }

    // const models = Reflect.ownKeys(this).filter(key => typeof key === 'string' && !key.startsWith("_"));

    // return Promise.all(
    //     models.map((modelKey) => {
    //         if(typeof modelKey === 'string') {

    //             return (
    //               this as unknown as Record<
    //                 string,
    //                 { deleteMany: () => Promise<unknown> }
    //               >
    //             )[modelKey].deleteMany();
    //         }
    //     })
    // )
    await this.cart.deleteMany();
    await this.cartItem.deleteMany();
    await this.payment.deleteMany();
    await this.order.deleteMany();
    await this.cart.deleteMany();
    await this.product.deleteMany();
    await this.category.deleteMany();
    await this.user.deleteMany();
  }
}
