export class ManufacturedMaterials {
    manufacturedMaterialsId: number;
    name: string;
    sku: string;
    suppliersId: number = 1;
    commentBox: string;
    unitsOfMeasureId: number = 1;
    picPath: string = '../../../assets/images/no-image.png';
    createdBy: string;
    createdDate: Date;
    manufacturedMaterialsInfo: ManufacturedMaterialsInfo[];
  }

  export class ManufacturedMatsColumns{
    'ID': number = 0;
    'Name': string = '';
    'SKU': string = '';
    'Supplier': string = '';
    'Unit': string = '';
  }
  
  export class ManufacturedMaterialsInfo {
    manufacturedMaterialsInfoId: number;
    manufacturedMaterialsId: number;
    materialCodeId: number;
    size: string;
    weight: number = 0;
    stockQty: number = 0;
    supplierSku: string;
    supplierPrice: number = 0;
  }
  