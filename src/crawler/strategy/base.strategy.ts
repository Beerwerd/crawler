import { CrawlerEvent, PaginationType } from '../types';
import { Browser, launch, Page } from 'puppeteer';
import { Env } from '../../config/env';
import { absoluteUrl, getFromElementListWithPagination } from '../tools';
import { EventEmitter } from 'events';

type BaseStrategyOpts = {
  productListSelector: string;
  paginationButton: string;
  linkSelector: string;
  paginationType: PaginationType;
  getModelTitleFromPage: string;
  getModelNameFromPage: string;
  getModelPriceFromPage: string;
  getModelCurrencyFromPage: string;
  getModelSpecsFromPage(page: Page): Promise<object[]>;
};

export abstract class BaseStrategy extends EventEmitter {
  constructor(private opts: BaseStrategyOpts) {
    super();
  }

  async parseProductList(url: string): Promise<void> {
    this.emit(CrawlerEvent.START_PROCESS);

    const browser = await launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
      ],
    });
    const page: Page = await browser.newPage();

    try {
      await page.goto(url);
      await page.waitForSelector('body', { timeout: Env.WAITING_TIMEOUT });

      this.emit(CrawlerEvent.LOG, `page is loaded ${page.url()}`);

      const links = await (
        await page.$('body')
      ).evaluate(
        (e, selector) =>
          Array.from(document.querySelectorAll(selector)).map(
            (a: any) => a.href,
          ),
        this.opts.linkSelector,
      );

      const searchPageList = [...new Set(links)];

      if (!searchPageList.length) {
        throw new Error(`There were not found links on the page ${url}`);
      }

      this.emit(
        CrawlerEvent.LOG,
        `found pages for search: ${searchPageList.length}`,
      );

      for await (const [id, pageLink] of searchPageList.entries()) {
        const url = absoluteUrl(page.url(), pageLink);

        await this.parseListPage(url, page);

        this.emit(CrawlerEvent.PROGRESS, (id * 98) / searchPageList.length + 1);
      }

      this.emit(CrawlerEvent.FINISH_PROCESS);
    } catch (e) {
      this.emit(CrawlerEvent.ERROR, new Error(`Error, details: ${e.message}`));
    } finally {
      await browser.close();
    }
  }

  async parseListPage(url: string, page: Page): Promise<void> {
    this.emit(CrawlerEvent.LOG, `check page: ${url}`);
    try {
      await page.goto(url);
      await page.waitForSelector(this.opts.productListSelector, {
        timeout: Env.WAITING_TIMEOUT,
      });

      const currentWebsite = page.url();
      this.emit(CrawlerEvent.LOG, `page loaded ${currentWebsite}`);

      const modelLinkList = await this.getModelListFromPage(page);

      if (!modelLinkList.length) {
        return;
      }

      const products = modelLinkList.map((url) => ({
        url: absoluteUrl(currentWebsite, url),
      }));

      this.emit(CrawlerEvent.DATA, products);
    } catch (e) {
      // it is not product page
    }
  }

  async parseProduct(url: string): Promise<void> {
    let browser: Browser;
    try {
      this.emit(CrawlerEvent.START_PROCESS);
      browser = await launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      });
      const page: Page = await browser.newPage();

      await page.goto(url);
      await page.waitForSelector('body');
      await new Promise((r) => setTimeout(r, 1000));

      const title = await this.saveExtrude(
        page,
        this.opts.getModelTitleFromPage,
      );
      const name = await this.saveExtrude(page, this.opts.getModelNameFromPage);
      const price = await this.saveExtrude(
        page,
        this.opts.getModelPriceFromPage,
      );
      const currency = await this.saveExtrude(
        page,
        this.opts.getModelCurrencyFromPage,
      );

      this.emit(CrawlerEvent.DATA, {
        title,
        name,
        price,
        currency,
        specs: await this.opts.getModelSpecsFromPage(page),
      });

      this.emit(CrawlerEvent.FINISH_PROCESS);
    } catch (e) {
      this.emit(CrawlerEvent.ERROR, e);
    } finally {
      await browser.close();
    }
  }

  async saveExtrude(page: Page, query: string) {
    try {
      return await page.evaluate(query);
    } catch (e) {
      console.log(e.message);
      return '';
    }
  }

  getModelListFromPage(page: Page) {
    return getFromElementListWithPagination({
      selector: this.opts.productListSelector,
      page,
      cb: (el) => el.getAttribute('href'),
      pagination: this.opts.paginationButton,
      paginationType: this.opts.paginationType,
    });
  }
}
