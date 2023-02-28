import { MaterialCode } from './../models/material-code';
import { Suppliers } from './../models/suppliers.model';

export class Chain {
  chainId: number = 0;
  chainTypeId: number = 1;
  chainLinkSizeId: number = 1;
  materialCode: number = 2;
  pricePerInch: number = 0;
  stockQty: number = 0;
  suppliersId: number = 1;
  chainLinkSize: ChainLinkSize;
  chainType: ChainType;
  materialCodeNavigation: MaterialCode;
  suppliers: Suppliers;
}

export class ChainLinkSize {
  chainLinkSizeId: number = 0;
  linkSize: string = '';
}

export class ChainType {
  chainTypeId: number = 0;
  chainTypeName: string = '';
}

