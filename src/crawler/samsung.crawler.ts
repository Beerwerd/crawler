import { Page, ElementHandle } from 'puppeteer';
import { PaginationType } from './types';
import { BaseStrategy } from './strategy/base.strategy';

export class SamsungCrawler extends BaseStrategy {
  constructor() {
    super({
      linkSelector: 'a[href*="all-"]',
      paginationType: PaginationType.LOAD_MORE,
      paginationButton: '.pd03-product-finder__content a[an-ac="view more"]',
      productListSelector:
        '.pd03-product-finder__content .pd03-product-card .pd03-product-card__product-image a',
      getModelTitleFromPage:
        "document.querySelector('.pd-header-navigation__headline-text').innerText",
      getModelNameFromPage: "document.querySelector('#modelCode').value",
      getModelPriceFromPage:
        "document.querySelector('.cost-box__price-now').innerText.match(/[\\d\\.\\,]+$/)[0]",
      getModelCurrencyFromPage:
        "document.querySelector('.cost-box__price-now').innerText[document.querySelector('.cost-box__price-now').innerText.indexOf(document.querySelector('.cost-box__price-now').innerText.match(/[\\d\\.\\,]+$/)[0]) - 1]",
      getModelSpecsFromPage: async (page: Page) =>
        SamsungCrawler.parseSpecObject(
          await page.$$('.spec-highlight__detail'),
        ),
    });
  }

  private static async parseSpecObject(specs: ElementHandle[]) {
    const result = [];
    for await (const spec of specs) {
      try {
        const category = await (
          await spec.$('h4.spec-highlight__title')
        ).evaluate((el: any) => el.innerText.trim());
        const params = {};

        const paramsList = await spec.$$('li.spec-highlight__item');
        for await (const param of paramsList) {
          const paramName = await (
            await param.$('.spec-highlight__title')
          ).evaluate((el: any) => el.innerText.trim());
          const paramValue = await (
            await param.$('.spec-highlight__value')
          ).evaluate((el: any) => el.innerText.trim());

          if (paramName && paramValue) {
            result.push({
              name: paramName,
              value: paramValue,
              category,
            });
            params[paramName] = paramValue;
          }
        }
      } catch (e) {
        // just skip
      }
    }

    return result;
  }
}
