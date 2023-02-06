import { Module } from '@nestjs/common';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/db';
import { ProductModule } from './product/product.module';
import { SpecModule } from './spec/spec.module';
import { ParsingModule } from './parsing/parsing.module';
import { BullModule } from '@nestjs/bull';
import { Env } from './config/env';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    ManufacturerModule,
    ParsingModule,
    ProductModule,
    SpecModule,
    CrawlerModule,
    TypeOrmModule.forRoot(dbConfig),
    BullModule.forRoot({
      redis: {
        host: Env.REDIS_HOST,
        port: Env.REDIS_PORT,
      },
    }),
  ],
})
export class AppModule {}
