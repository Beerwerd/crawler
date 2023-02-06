import { Page, ElementHandle } from 'puppeteer';
import { PaginationType } from './types';
import { BaseStrategy } from './strategy/base.strategy';

export class BoschCrawler extends BaseStrategy {
  constructor() {
    super({
      linkSelector: 'a[href*="/product-list/"]',
      paginationType: PaginationType.LINK_PAGE,
      paginationButton: '?pageNumber=::pageCount::',
      productListSelector:
        '.productlist-products div[data-product-type="product"] .product-title a',
      getModelTitleFromPage:
        "document.querySelector('.m-producttitle h1.a-heading').innerText.trim()",
      getModelNameFromPage:
        "document.querySelector('.m-producttitle h2.a-heading').innerText.trim()",
      getModelPriceFromPage: '',
      getModelCurrencyFromPage: '',
      getModelSpecsFromPage: async (page: Page) =>
        BoschCrawler.parseSpecObject(
          await page.$$('#section-technical-overview .overview-content'),
        ),
    });
  }

  private static async parseSpecObject(specs: ElementHandle[]) {
    const result = [];
    for await (const spec of specs) {
      try {
        const paramName = await (
          await spec.$('span.highlight')
        ).evaluate((el: any) => el.innerText.trim());
        const paramValue = await (
          await spec.$('p.js-technicalText')
        ).evaluate((el: any) => el.innerText.trim());

        if (paramName && paramValue) {
          result.push({
            name: paramName,
            value: paramValue,
          });
        }
      } catch (e) {
        // just skip
      }
    }

    return result;
  }
}
