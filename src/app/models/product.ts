export class Product{
    productsId: number;
    productName: string = '';
    sku: string = '';
    customerSku: string = '';
    productsTypeId: number = 1;
    productDesc: string = '';
    customerCode: number = 5;
    commentBox: string = '';
    status: number = 1;
    uom: number = 1;
    picPath: string = '../../../assets/images/no-image.png';
    jewelryType: number = 1;
    createdBy: string = '';
    createdDate: Date;
    firstProductionDate: Date;
    productTypeName: string = "";
    jewelryTypeName: string = "";
    productsDmns: ProductsDMNS[];
    productsBom: ProductsBOM[];
    productsInfo : ProductsInfo[];
    productsStoreInfo: ProductsStoreInfo[];
    productstoreflag: Productstoreflag[];
    productsPrices: any[];
    productsStock: any[];
    productsWtg: any[];
    storePrices: any[];
    inStore: boolean;
    customerCodeNavigation: customerCodeNavigation;
    productsRouting: ProductsRouting[];
}

export class ProductStatus{
    statusId: number;
    status: string;
}

export class ProductsBOM{
    productsBomid: number;
    bomItemTypeId: number;
    productsId: number;
    subItemId: number = 0;
    itemQty: number;
    sizeLocked: boolean;
    custProvided: string = '';
    notes: string = '';
    productsInfoId: number = 0;
    subItemInfoId: number = 0;
}

export class ProductsBOMResponse{
    productsBomid: number;
    productsId: number;
    subProductsId: number;
    qty: number;
    notes: string;
    // Extra field for display purpose
    productName: string;
}

export class ProductsDMNS{
    productsDmnsId: number;
    productsId: number;
    heightMm: number = 0;
    widthMm: number = 0;
    lengthMm: number = 0;
}

export class Productstoreflag {
  productStoreFlagId: number;
  productsId: number;
  storeFlag: Boolean;
  products: any;
}

export class ProductDetailResponse{
    productsId: number;
    productName: string;
    productsTypeId: number;
    productDesc: string;
    commentBox: string;
    picPath: string;
    jewelryType: number;
    inStore: boolean;
    productDimensions: Dimension = new Dimension();
    materials: Material[];
}

export class Dimension{
    heightMm: number = 0;
    widthMm: number = 0;
    lengthMm: number = 0;
}

export class Material{
    materialCodeId: number;
    code: string;
    karat: string;
    color: string;
    description: string;
    sizeRetailPrices: SizeRetailPrice[] = [];
}

export class SizeRetailPrice{
    size: number;
    price: number;
    weight: number;
}


export class ProductsInfo {
  productsInfoId: number;
  productsId: number;
  materialCodeId: number;
  size: string;
  weight: number;
  stockQty: number;
  priceWhls: number;
  priceRetail: number;
  metalGrainsId: number;
}

export class ProductsStoreInfo {
  productsStoreInfoId: number;
  productsId: number;
  productsDesc: string;
  storeFlag: boolean;
  collectionsId: number;
  productsGroupId: number;
  productsGroupLevel: number;
  height: number;
  width: number;
  length: number;
}

export class GroupItem{
    productsId: number;
    productsGroupId: number;
    productsGroupLevel: number;
}

export class GroupItemRequest{
    groupItems: GroupItem[] = [];
}

export class customerCodeNavigation {
  custIdno: number;
  customerId: string;
  companyName: string;
  contactName: string;
  emailAddress: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  fax: string;
  shippingMethod: string;
  paymentTerms: string;
}

export class ProductsRouting {
  productsRoutingId: number;
  productsId: number;
  routingCodesId: number;
  standardTime: number = 0;
  actualTimeS: number = 0;
  comment: string;
}

export class RoutingCodes {
  routingCodesId: number;
  activityCode: string;
  department: string;
  activityDesc: string;
}
