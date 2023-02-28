export class WorkOrder{
    workOrdersId: number = 0;
    createdDate: Date;
    closedDate: Date;
    location: string = '';
    workOrderDetails: WorkOrderDetail[] = [];
}

export class WorkOrderDetail{
    workOrderDetailsId: number = 0;
    workOrdersId: number = 0;
    ordersDetailsId: number = 0;
    qtyinit: number = 1;
    qtyclosed: number = 0;
    wgtpitem: number = 0;
}

export class WorkOrderReport{
    workOrdersId: number = 0;
    createdDate: Date;
    closedDate: Date;
    location: string = '';
    workOrderPrintReports: WorkOrderPrintReport[] = [];
}

export class WorkOrderPrintReport{
    workOrderId: number = 0;
    workOrderDetailsId: number = 0;
    qtyinit: number = 0;
    qtyclosed: number = 0;
    itemName: string = '';
    itemPhoto: string = '';
    routingJSON: string = '';
    bomjson: string = '';
    metal: string = '';
    size: string = '';
    guid: string = '';
}

export class WorkOrderDetailDisplay{
    productName: string = '';
    photo: string = '';
    material: string = '';
    size: string = '';
    workOrderDetail: WorkOrderDetail = new WorkOrderDetail();
}