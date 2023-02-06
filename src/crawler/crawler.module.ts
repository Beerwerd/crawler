import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ManufacturerModule } from '../manufacturer/manufacturer.module';
import { ProductModule } from '../product/product.module';
import { ParsingModule } from '../parsing/parsing.module';
import { CrawlerProcessor } from './crawler.processor';

@Module({
  imports: [
    ParsingModule,
    ManufacturerModule,
    ProductModule,
    BullModule.registerQueue({
      name: 'crawler',
    }),
  ],
  providers: [CrawlerProcessor],
})
export class CrawlerModule {}
