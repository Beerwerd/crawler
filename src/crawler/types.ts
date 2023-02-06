export enum PaginationType {
  CURRENT_REFRESH = 'current_refresh',
  LOAD_MORE = 'load_more',
  LINK_PAGE = 'link_page',
}

export enum CrawlerEvent {
  START_PROCESS = 'start-process',
  LOG = 'log',
  ERROR = 'error',
  FINISH_PROCESS = 'finish-process',
  DATA = 'data',
  PROGRESS = 'progress',
}

export enum CrawlerProcessEnum {
  GET_PRODUCT_LIST = 'get-product-list',
  GET_PRODUCT = 'get-product',
  SEARCH_PRODUCT = 'search-product',
}
