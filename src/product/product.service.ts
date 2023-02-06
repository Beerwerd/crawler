import { BadRequestException, Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParsingService } from '../parsing/parsing.service';
import { SpecService } from '../spec/spec.service';
import { ParsingStatusEnum } from '../parsing/parsing.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private parsingService: ParsingService,
    private specService: SpecService,
  ) {}

  async getOne(productId: number) {
    const product = await this.productRepo.findOne({
      where: {
        id: productId,
      },
      relations: {
        specs: true,
        parsing: true,
        manufacturer: true,
      },
    });

    if (!product) {
      throw new BadRequestException('Product Not Found');
    }

    if (!product.parsing) {
      const { parsing } = await this.parseProduct(product);

      return parsing;
    }

    if (product.parsing.status !== ParsingStatusEnum.COMPLETED) {
      return product.parsing;
    }

    const { parsing, manufacturer, ...rest } = product;

    return rest;
  }

  async parseProduct(product: Product) {
    product.parsing = await this.parsingService.parseProduct(product);

    return this.productRepo.save(product);
  }

  async save(products: Product[]) {
    await this.productRepo
      .createQueryBuilder()
      .insert()
      .values(products)
      .orIgnore()
      .execute();
  }

  async fillProduct(product: Product): Promise<void> {
    product.specs.forEach((spec) => {
      spec.productId = product.id;
    });

    product.specs = await this.specService.save(product.specs);

    await this.productRepo.save(product);
  }
}
