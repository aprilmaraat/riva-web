export class MaterialCode{
    materialCodeId: number = 0;
    code: string = '';
    karat: string = '';
    color: string = '';
    description: string = '';
}

export class MatCodeSize {
  productID: number;
  matID: number;
  size: number;
  uom: number;
  qtyStock: number;
  wtgr: number;
  whlsprice: number;
  msrp: number;
}

export class Sizes {
  size: number;
}

export class SizeUpdate {
  materialCodeId: number;
  oldSize: number;
  newSize: number;
}