import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ParsingService } from '../parsing/parsing.service';
import { ProductService } from '../product/product.service';
import { Parsing, ParsingStatusEnum } from '../parsing/parsing.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { LgCrawler } from './lg.crawler';
import { SamsungCrawler } from './samsung.crawler';
import { BoschCrawler } from './bosch.crawler';
import { Logger, NotFoundException } from '@nestjs/common';
import { CrawlerEvent, CrawlerProcessEnum } from './types';
import { Product } from '../product/product.entity';
import { BaseStrategy } from './strategy/base.strategy';

@Processor('crawler')
export class CrawlerProcessor {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(
    private parsingService: ParsingService,
    private manufacturerService: ManufacturerService,
    private productService: ProductService,
  ) {}

  @Process(CrawlerProcessEnum.GET_PRODUCT_LIST)
  async handleProductListParsing(job: Job) {
    const { manufacturer, parsing } = job.data;

    const crawler = this.getCrawler(manufacturer);

    this.setupListeners(
      crawler,
      parsing,
      async (data: Product[]) =>
        await this.manufacturerService.addProducts(manufacturer, data),
    );

    crawler.parseProductList(manufacturer.url);
  }

  @Process(CrawlerProcessEnum.GET_PRODUCT)
  async handleProductParsing(job: Job) {
    const { product, parsing } = job.data;

    const crawler = this.getCrawler(product.manufacturer);

    this.setupListeners(
      crawler,
      parsing,
      async (data: Product) =>
        await this.productService.fillProduct({ id: product.id, ...data }),
    );

    crawler.parseProduct(product.url);
  }

  private setupListeners(
    crawler: BaseStrategy,
    parsing: Parsing,
    onData: (data: any) => void,
  ): void {
    crawler.on(CrawlerEvent.START_PROCESS, async () => {
      parsing = await this.parsingService.save({
        id: parsing.id,
        status: ParsingStatusEnum.RUNNING,
        progress: 1,
      });
      await this.addLog(parsing, 'Start process');
    });

    crawler.on(CrawlerEvent.FINISH_PROCESS, async () => {
      parsing = await this.parsingService.save({
        id: parsing.id,
        status: ParsingStatusEnum.COMPLETED,
        progress: 100,
      });
      await this.addLog(parsing, 'Finish process');
    });

    crawler.on(CrawlerEvent.ERROR, async (e) => {
      parsing = await this.parsingService.save({
        id: parsing.id,
        status: ParsingStatusEnum.ERROR,
        error: e.message,
      });
    });

    crawler.on(CrawlerEvent.DATA, onData);

    crawler.on(CrawlerEvent.LOG, async (data: string) => {
      await this.addLog(parsing, data);
    });

    crawler.on(CrawlerEvent.PROGRESS, async (progress: number) => {
      if (progress > 99) progress = 99;
      if (progress < parsing.progress) return;

      parsing = await this.parsingService.save({
        id: parsing.id,
        progress: Math.floor(progress),
      });
    });
  }

  private async addLog(parsing: Parsing, log: string): Promise<void> {
    this.logger.debug(`parsing #${parsing.id}: ${log}`);
  }

  private getCrawler(manufacturer: Manufacturer): BaseStrategy {
    switch (manufacturer.brand) {
      case 'LG':
        return new LgCrawler();
      case 'Samsung':
        return new SamsungCrawler();
      case 'Bosch':
        return new BoschCrawler();
      default:
        throw new NotFoundException(
          `crawler for manufacturer ${manufacturer.brand} NOT FOUND`,
        );
    }
  }
}
