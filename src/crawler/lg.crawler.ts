import { Page, ElementHandle } from 'puppeteer';
import { PaginationType } from './types';
import { BaseStrategy } from './strategy/base.strategy';

export class LgCrawler extends BaseStrategy {
  constructor() {
    super({
      linkSelector: 'a',
      paginationType: PaginationType.CURRENT_REFRESH,
      paginationButton: '.pagination>ul li button',
      productListSelector: '.container .product-list-box ul.list-box>li>div>a',
      getModelTitleFromPage: "document.querySelector('.model-title').innerText",
      getModelNameFromPage:
        "document.querySelector('.model-name').getAttribute('data-model-name')",
      getModelPriceFromPage:
        "document.querySelector('.product-selling-price .price .number').innerText",
      getModelCurrencyFromPage:
        "document.querySelector('.product-selling-price .price .unit').innerText",
      getModelSpecsFromPage: async (page: Page) =>
        LgCrawler.parseSpecObject(await page.$$('.tech-spacs')),
    });
  }

  private static async parseSpecObject(specs: ElementHandle[]) {
    const result = [];
    for await (const spec of specs) {
      try {
        const category = await (
          await spec.$('.tech-spacs-title')
        ).evaluate((el: any) => el.innerText.trim());
        const params = {};

        const paramsList = await spec.$$('.tech-spacs-contents dl');
        for await (const param of paramsList) {
          const paramName = await (
            await param.$('dt')
          ).evaluate((el: any) => el.innerText.trim());
          const paramValue = await (
            await param.$('dd')
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
