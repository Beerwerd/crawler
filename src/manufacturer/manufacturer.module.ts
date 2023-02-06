import { Module } from '@nestjs/common';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacturer } from './manufacturer.entity';
import { ProductModule } from '../product/product.module';
import { ParsingModule } from '../parsing/parsing.module';

@Module({
  imports: [
    ParsingModule,
    ProductModule,
    TypeOrmModule.forFeature([Manufacturer]),
  ],
  controllers: [ManufacturerController],
  providers: [ManufacturerService],
  exports: [ManufacturerService],
})
export class ManufacturerModule {}
