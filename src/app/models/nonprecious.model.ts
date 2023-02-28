import { Suppliers } from '../models/suppliers.model';
import { UnitOfMeasure } from '../models/unit-of-measure';

export class Nonprecious {
  nonPreciousId: number;
  name: string;
  sku: string;
  suppliersId: number = 1;
  supplierSku: string = '';
  commentBox: string;
  unitsOfMeasureId: number = 2;
  picPath: string = '../../../assets/images/no-image.png';
  createdBy: string;
  createdDate: Date;
  stockQty: number = 0;
  supplierPrice: number = 0;
  suppliers: Suppliers;
  unitsOfMeasure: UnitOfMeasure;
}

export class NonpreciousColumns{
  'ID': number = 0;
  'Name': string = '';
  'SKU': string = '';
  'Supplier': string = '';
  'Unit': string = '';
  'Stock QTY': string = '';
  'Supplier Price': string = '';
}
