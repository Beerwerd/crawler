import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Manufacturer } from './manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';
import { Product } from '../product/product.entity';
import { ParsingManufacturerDto } from './dto/parsing-manufacturer.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { Parsing } from '../parsing/parsing.entity';

@Controller('manufacturers')
export class ManufacturerController {
  constructor(private service: ManufacturerService) {}

  @Get()
  @ApiOkResponse({ type: Manufacturer })
  getList(): Promise<Manufacturer[]> {
    return this.service.getAll();
  }

  @Get(':manufacturerId/products')
  @ApiOkResponse({ type: [Product] })
  async getProductList(
    @Param('manufacturerId') manufacturerId: number,
  ): Promise<Product[]> {
    return this.service.getProductList(manufacturerId);
  }

  @Patch(':manufacturerId/parsing')
  @ApiOkResponse({ type: Parsing })
  async parseManufacturer(
    @Body() dto: ParsingManufacturerDto,
    @Param('manufacturerId', new ParseIntPipe()) manufacturerId: number,
  ) {
    return this.service.parseManufacturer(manufacturerId, dto);
  }
}
