import { Page } from 'puppeteer';
import { PaginationType } from './types';
import { Env } from '../config/env';

type GetFromElementListOpts<T = any> = {
  selector: string;
  page: Page;
  cb?: (el: HTMLElement) => T;
};

export async function getFromElementList<T = any>({
  selector,
  page,
  cb,
}: GetFromElementListOpts<T>): Promise<T[]> {
  const result: T[] = [];

  const list = await page.$$(selector);

  for await (const a of list) {
    result.push(await a.evaluate(cb as any));
  }

  return result;
}

type GetFromElementListWithPaginationOpts<T = any> =
  GetFromElementListOpts<T> & {
    pagination: string;
    paginationType: PaginationType;
  };
export async function getFromElementListWithPagination<T = any>(
  opts: GetFromElementListWithPaginationOpts<T>,
): Promise<T[]> {
  switch (opts.paginationType) {
    case PaginationType.CURRENT_REFRESH:
      return getPageWithCurrentRefresh(opts);
    case PaginationType.LOAD_MORE:
      return getPageWithLoadMore(opts);
    case PaginationType.LINK_PAGE:
      return getPageWithLinkPage(opts);
    default:
      return [];
  }
}

export async function getPageWithCurrentRefresh<T>({
  pagination,
  selector,
  page,
  cb,
}: GetFromElementListWithPaginationOpts<T>) {
  let result = await getFromElementList({ selector, page, cb });

  const pageLinks = await page.$$(pagination);

  if (!pageLinks?.length || pageLinks.length < 2) {
    return result;
  }

  for await (const [id] of pageLinks.entries()) {
    const freshPageLinks = await page.$$(pagination);
    const firstElement = await page.$(selector);
    const currentValue = await firstElement.evaluate((el) => el.innerHTML);
    await freshPageLinks[id].evaluate((el: any) => el.click());

    await page.waitForFunction(
      (selector, currentValue) =>
        document.querySelector(selector).innerHTML != currentValue,
      { timeout: Env.WAITING_TIMEOUT },
      selector,
      currentValue,
    );

    const pageList = await getFromElementList({ selector, page, cb });

    result = [...result, ...pageList];
  }

  return [...new Set(result)];
}

export async function getPageWithLoadMore<T>({
  pagination,
  selector,
  page,
  cb,
}: GetFromElementListWithPaginationOpts<T>) {
  while (true) {
    const nextButton = await page.$(pagination);

    const currentCount = (await page.$$(selector)).length;

    const hasMore = !!(await page.$(
      '.productlist-products .pagination-loadmore',
    ));
    if (!hasMore) {
      break;
    }

    await nextButton.evaluate((el: any) => el.click());

    await page.waitForFunction(
      (selector, currentCount) =>
        document.querySelectorAll(selector).length != currentCount,
      { timeout: Env.WAITING_TIMEOUT },
      selector,
      currentCount,
    );
  }

  return getFromElementList({ selector, page, cb });
}

export async function getPageWithLinkPage<T>({
  pagination,
  selector,
  page,
  cb,
}: GetFromElementListWithPaginationOpts<T>) {
  const url = page.url();
  let result = [];
  let pageNumber = 1;
  while (true) {
    try {
      page.goto(url + pagination.replace('::pageCount::', `${pageNumber}`));
      await page.waitForSelector('body', { timeout: Env.WAITING_TIMEOUT });
      const res = await getFromElementList({ selector, page, cb });

      if (!res.length) {
        break;
      }

      result = [...result, ...res];
    } catch (e) {
      break;
      // just skip
    }

    pageNumber++;
  }

  return result;
}

export function absoluteUrl(currentUrl: string, relativeUrl: string): string {
  return new URL(relativeUrl, currentUrl).href;
}
