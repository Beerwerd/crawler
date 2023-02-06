import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Manufacturer } from './manufacturer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.entity';
import { ParsingStatusEnum } from '../parsing/parsing.entity';
import { ParsingManufacturerDto } from './dto/parsing-manufacturer.dto';
import { ParsingService } from '../parsing/parsing.service';

@Injectable()
export class ManufacturerService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Manufacturer)
    private manufacturerRepo: Repository<Manufacturer>,
    private productService: ProductService,
    private parsingService: ParsingService,
  ) {}

  async getAll(): Promise<Manufacturer[]> {
    return this.manufacturerRepo.find({
      select: {
        id: true,
        brand: true,
        url: true,
      },
      relations: {
        parsing: true,
      },
    });
  }

  async getProductList(manufacturerId: number): Promise<Product[]> {
    const manufacturer = await this.manufacturerRepo.findOne({
      select: {
        products: {
          id: true,
          url: true,
        },
      },
      where: {
        id: manufacturerId,
      },
      relations: {
        products: true,
      },
    });

    if (!manufacturer) {
      throw new BadRequestException('Manufacturer Not Found');
    }

    return manufacturer.products;
  }

  async parseManufacturer(manufacturerId: number, dto: ParsingManufacturerDto) {
    const manufacturer = await this.manufacturerRepo.findOne({
      where: {
        id: manufacturerId,
      },
      relations: {
        parsing: true,
      },
    });

    if (!manufacturer) {
      throw new BadRequestException('Manufacturer Not Found');
    }

    if (
      manufacturer.parsing &&
      !dto.parse &&
      [ParsingStatusEnum.RUNNING, ParsingStatusEnum.COMPLETED].includes(
        manufacturer.parsing.status,
      )
    ) {
      return manufacturer.parsing;
    }

    const { parsing } = await this.newParsing(manufacturer);

    return parsing;
  }

  async newParsing(manufacturer: Manufacturer): Promise<Manufacturer> {
    manufacturer.parsing = await this.parsingService.parseManufacturer(
      manufacturer,
    );

    return this.manufacturerRepo.save(manufacturer);
  }

  async addProducts(
    manufacturer: Manufacturer,
    products: Product[],
  ): Promise<void> {
    products.forEach((product) => {
      product.manufacturerId = manufacturer.id;
    });

    await this.productService.save(products);
  }

  onModuleInit() {
    console.log('init part....');
  }

  async onApplicationBootstrap() {
    console.log('run parsing...');
    const manufacturers = await this.manufacturerRepo.find();

    console.log(manufacturers.length);
    manufacturers.forEach((manufacturer) => {
      try {
        this.parseManufacturer(manufacturer.id, {});
      } catch (e) {
        // skip parsing if error
      }
    });
  }
}
