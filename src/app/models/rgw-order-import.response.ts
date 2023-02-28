export class OrderImportResponse{
    invalidOrders: RGWInvalidOrder[] = [];
    succeedOrders: number = 0;
    failedOrders: number = 0;
    orderExists: boolean = false;
}

export interface RGWInvalidOrder{
    orderNumber: string,
    orderCode: string,
    errorMessage: string
}

