export class InventoryLog{
    id: number = 0;
    barcodeId: number;
    itemType: string;
    itemNo: string;
    karat: string;
    entryDate: Date;
    qtyOld: number;
    qtyNew: number;
    gramWgtOld: number;
    gramWgtNew: number;
    webUser: string;
}

export class ProductInventory{
    productsId: number = 0;
    productName: string = '';
    sku: string = '';
    productType: string = '';
    customerId: string = '';
    companyName: string = '';
    status: string = '';
    jewelryType: string = '';
    materialInfoJson: string = '';
}

export class MaterialInfoJSON{
    Code: string = '';
    Descriptino: string = '';
    PI: ProductInfoJSON[] = [];
}

export class ProductInfoJSON{
    Size: string = '';
    Weight: string = '';
    Wholesale: string = '';
    Retail: string = '';
}