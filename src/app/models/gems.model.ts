export class Gems {
  gemsId: number;
  gemName: string = "";
  gemCutsId: number;
  picPath: string;
  gemCuts: GemCuts[];
}

export class GemCuts {
  gemCutsId: number = 0;
  cutName: string = '';
}

export class GemTypes {
  gemTypesId: number = 0;
  colorClarity: string = '';
}

export class GemSizes {
  gemSizesId: number = 0;
  gemCutsId: number = 0;
  gemSizeDesc: string = '';
}

export class GemInventory {
  gemInventoryId: number;
  gemTypesId: number;
  gemCutsId: number;
  gemSizesId: number;
  pricePerCarat: number = 0;
  pricePerUnit: number = 0;
  stockQty: number = 0;
  caratWeight: number = 0;
  suppliersId: number = 1;

  gemCuts: GemCuts = new GemCuts();
  gemTypes: GemTypes = new GemTypes();
  gemSizes: GemSizes = new GemSizes();
}

export class GemsColumns {
  'ID': number = 0;
  'Name': string = "";
  'Price Per Carat': number = 0;
  'Price Per Unit': number = 0;
  'Carat Weight': number = 0;
  'Supplier': string = '';
}

