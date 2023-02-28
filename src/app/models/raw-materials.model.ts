export class RawMaterials {
  rawMaterialsId: number = 0;
  name: string;
  sku: string;
  supplierSku: string;
  materialCodeId: number = 2;
  suppliersId: number = 1;
  commentBox: string;
  unitsOfMeasureId: number = 1;
  picPath: string = '../../../assets/images/no-image.png';
  createdBy: string;
  createdDate: Date;
  supplierPrice: number = 0;
  sellPrice: number = 0;
  qtyStock: number = 0;
  stockLocation: string;
  rawMaterialsInfo: Rawmaterialsinfo[];
}

export class Rawmaterialsinfo {
  rawMaterialsInfoId: number;
  rawMaterialsId: number;
  materialCodeId: number;
  size: string;
  weight: number = 0;
  stockQty: number = 0;
}
