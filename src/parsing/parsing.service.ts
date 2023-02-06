import { Injectable, NotFoundException } from '@nestjs/common';
import { Parsing, ParsingStatusEnum } from './parsing.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Product } from '../product/product.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CrawlerProcessEnum } from '../crawler/types';

@Injectable()
export class ParsingService {
  constructor(
    @InjectQueue('crawler') private readonly parsingQueue: Queue,
    @InjectRepository(Parsing) private parsingRepo: Repository<Parsing>,
  ) {}

  async getOne(parsingId: number) {
    const parsing = await this.parsingRepo.findOne({
      where: {
        id: parsingId,
      },
      relations: {
        manufacturer: true,
        product: {
          specs: true,
        },
      },
    });

    if (!parsing) {
      throw new NotFoundException('Parsing Not Found');
    }

    const { manufacturer, product, ...rest } = parsing;

    if (parsing.status !== ParsingStatusEnum.COMPLETED) {
      return rest;
    }

    if (manufacturer) {
      return manufacturer;
    }
    if (product) {
      return product;
    }

    return parsing;
  }

  async parseManufacturer(manufacturer: Manufacturer) {
    const parsing = await this.parsingRepo.save(new Parsing());

    await this.parsingQueue.add(CrawlerProcessEnum.GET_PRODUCT_LIST, {
      manufacturer,
      parsing,
    });

    return parsing;
  }

  async parseProduct(product: Product) {
    const parsing = await this.parsingRepo.save(new Parsing());

    await this.parsingQueue.add(CrawlerProcessEnum.GET_PRODUCT, {
      product,
      parsing,
    });

    return parsing;
  }

  async save(parsing: Partial<Parsing>): Promise<Parsing> {
    return this.parsingRepo.save(parsing);
  }
}
