import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  constructor(private service: ProductService) {}

  @Get('/:productId')
  @ApiOkResponse({ type: Product })
  async getList(@Param('productId') productId: number) {
    return this.service.getOne(productId);
  }
}
