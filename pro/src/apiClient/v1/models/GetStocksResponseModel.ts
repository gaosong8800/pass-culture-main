/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GetOfferStockResponseModel } from './GetOfferStockResponseModel';

export type GetStocksResponseModel = {
  hasStocks: boolean;
  stock_count: number;
  stocks: Array<GetOfferStockResponseModel>;
};

