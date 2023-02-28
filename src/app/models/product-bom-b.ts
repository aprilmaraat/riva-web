
export class BomResponse{
    bomId: number;
    bomQty: number;
    subItemId: number;
    sku: string;
    itemName: string;
    itemDescription: string;
    isSizeDependent: boolean;
    itemType: number;
    productsInfoId: number;
    subItemInfoId: number;
}

export class BomTableAResponse{
    id: number;
    name: string;
    sku: string;
    type: number;
}

export class FabMethod{
    id: number;
    fabMethod: string;
}