export class Findings {
  findingsId: number;
  name: string;
  sku: string;
  suppliersId: number = 1;
  commentBox: string;
  unitsOfMeasureId: number = 1;
  picPath: string = '../../../assets/images/no-image.png';
  createdBy: string;
  createdDate: Date;
  findingsInfo: FindingsInfo[];
}

export class FindingsColumn{
  'ID': number = 0;
  'Name': string = '';
  'SKU': string = '';
  'Supplier': string = '';
  'Unit': string = '';
}

export class FindingsInfo {
  findingsInfoId: number;
  findingsId: number;
  materialCodeId: number;
  size: string;
  weight: number = 0;
  stockQty: number = 0;
  supplierSku: string;
  supplierPrice: number = 0;
}
