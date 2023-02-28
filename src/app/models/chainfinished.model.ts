import { NumberValueAccessor } from '@angular/forms';
import { MaterialCode } from './../models/material-code';
import { Suppliers } from './suppliers.model';

export class Chainfinished {
  chainFinishedId: number;
  name: string;
  sku: string;
  suppliersId: number = 1;
  commentBox: string;
  picPath: string = '../../../assets/images/no-image.png';
  createdBy: string;
  createdDate: Date;
  suppliers: Suppliers;
  chainFinishedInfo: ChainfinishedInfo[];
}

export class ChainFinishedColumns{
  'ID': number = 0;
  'Name': string = '';
  'SKU': string = '';
}

export class ChainfinishedInfo {
  chainFinishedInfoId: number;
  chainFinishedId: number;
  materialCodeId: number;
  size: string = '';
  stockQty: number = 0;
  supplierSku: string = '';
  supplierPrice: number = 0;
  materialCode: MaterialCode;
}

// export class OptionSizes{
//   id: number = 0;
//   parentId: number = 0;
//   materialCodeId: number = 0;
//   size: string = '';
// }