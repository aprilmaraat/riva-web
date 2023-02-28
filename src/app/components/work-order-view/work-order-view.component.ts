import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { MaterialCode } from 'src/app/models/material-code';
import { Orders, OrdersDetails } from 'src/app/models/orders.model';
import { Product } from 'src/app/models/product';
import { WorkOrder, WorkOrderDetail, WorkOrderDetailDisplay, WorkOrderPrintReport, WorkOrderReport } from 'src/app/models/work-order';
import { AuthService } from 'src/app/services/auth.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { OrderService } from 'src/app/services/order.service';
import { WorkOrderService } from 'src/app/services/work-order.service';
import { GenericComponent, Guid } from '../generic/generic.component';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

@Component({
  selector: 'app-work-order-view',
  templateUrl: './work-order-view.component.html',
  styleUrls: ['./work-order-view.component.scss']
})
export class WorkOrderViewComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private orderService: OrderService
    , private workOrderService: WorkOrderService
    , private materialCodeService: MaterialCodeService
    , private modalService: NgbModal) {
      super(authService, loadService, alertService);
    }   

  ngOnInit(): void {
    this.load();
  }

  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

  workOrderReports: WorkOrderReport[] = [];
  filtered_workOrderReports: WorkOrderReport[] = [];
  select_wko: number = 1;

  orders: Orders[] = [];
  selectedOrderId: number = 0;
  selectedOrderItem: number = 0;
  selectedOrderDetail: OrdersDetails = new OrdersDetails();
  workOrder: WorkOrder = new WorkOrder();
  workOrderDetail: WorkOrderDetail = new WorkOrderDetail();
  materialCodes: MaterialCode[] = [];
  workOrderDetailDisplay: WorkOrderDetailDisplay = new WorkOrderDetailDisplay();
  detailDisplays: WorkOrderDetailDisplay[] = [];

  load(){
    this.materialCodeService.getList().subscribe(result => {
      this.materialCodes = result.responseObject;
    });
    this.selectedOrderDetail.products = new Product();
    this.orderService.getListOpenOrders().subscribe(result => {
      this.orders = result;
    });
    this.workOrderService.getListReport().subscribe(result => {
      this.workOrderReports = result;
      // this.filtered_workOrderReports = this.workOrderReports;
      this.filterWKO()
      this.setOpenWorkOrders();
    });
  }

  filterWKO(){
    if(this.select_wko == 0){
      this.filtered_workOrderReports = this.workOrderReports;
    }
    else if(this.select_wko == 1){
      this.filtered_workOrderReports = this.workOrderReports.filter(x => x.closedDate == null);
    }
    else if(this.select_wko == 2){
      this.filtered_workOrderReports = this.workOrderReports.filter(x => x.closedDate != null);
    }
  }

  addToWorkOrder(){
    this.selectedOrderItem = 0;
    this.workOrder.workOrderDetails.push(this.workOrderDetailDisplay.workOrderDetail);
    let map = new WorkOrderDetailDisplay();
    map.productName = this.workOrderDetailDisplay.productName;
    map.photo = this.workOrderDetailDisplay.photo
    map.material = this.workOrderDetailDisplay.material;
    map.size = this.workOrderDetailDisplay.size;
    map.workOrderDetail = this.workOrderDetailDisplay.workOrderDetail;
    this.detailDisplays.push(map);
    this.showOrderDetail();
  }

  removeDetail(detailDisplay: WorkOrderDetailDisplay, orderDetail: WorkOrderDetail){
    this.workOrder.workOrderDetails = this.workOrder.workOrderDetails.filter(x => x != orderDetail);
    this.detailDisplays = this.detailDisplays.filter(x => x != detailDisplay);
  }

  saveWorkOrder(){
    this.workOrderService.post(this.workOrder, '').subscribe(result => {
      this.alertService.success('Created work order');
      this.revertWorkOrder();
      this.workOrderService.getListReport().subscribe(result => {
        this.workOrderReports = result;
      });
    }, error => {
      this.alertService.error('Unable to save work order.');
    });
  }

  revertWorkOrder(){
    this.selectedOrderId = 0;
    this.selectedOrderItem = 0;
    this.detailDisplays = [];
    this.workOrder = new WorkOrder();
    this.workOrderDetailDisplay = new WorkOrderDetailDisplay();
  }

  get orderItems(){
    let orderItems = [];
    if(this.selectedOrderId != 0){
      orderItems = this.orders.find(x => x.ordersId == this.selectedOrderId).ordersDetails;
      this.detailDisplays.forEach(element => {
        orderItems = orderItems.filter(x => x.ordersDetailsId != element.workOrderDetail.ordersDetailsId);
      });
    }
    return orderItems;
  }

  getMaterial(){
    let x = this.materialCodes.find(x => x.materialCodeId == this.selectedOrderDetail.productsInfo.materialCodeId);
    if(x !== undefined){
      return x.description;
    }
    return '';
  }

  showOrderDetail(){
    this.workOrderDetailDisplay = new WorkOrderDetailDisplay();
    this.selectedOrderDetail = new OrdersDetails();
    this.selectedOrderDetail.products = new Product();
    if(this.selectedOrderId != 0){
      if(this.orders.find(x => x.ordersId == this.selectedOrderId).ordersDetails.length != 0){
        let x = this.orders.find(x => x.ordersId == this.selectedOrderId);
        this.selectedOrderDetail = x.ordersDetails.find(x => x.ordersDetailsId == this.selectedOrderItem);
        this.workOrderDetailDisplay.workOrderDetail.ordersDetailsId = this.selectedOrderDetail.ordersDetailsId;
        this.workOrderDetailDisplay.workOrderDetail.wgtpitem = this.selectedOrderDetail.productsInfo.weight;
        this.workOrderDetailDisplay.material = this.getMaterial();
        this.workOrderDetailDisplay.size = this.selectedOrderDetail.productsInfo.size;
        this.workOrderDetailDisplay.productName = this.selectedOrderDetail.products.productName;
        this.workOrderDetailDisplay.photo = this.selectedOrderDetail.products.picPath;
      }
    }
  }

  openWKOs: WorkOrderReport[] = [];
  openWKO: WorkOrderReport = new WorkOrderReport();
  openWKO_details: WorkOrderPrintReport[] = [];

  setOpenWorkOrders(){
    this.openWKOs = this.workOrderReports.filter(x => x.closedDate == null);
    this.filterOpenWKOs();
  }

  selectOpenWKO(wko: WorkOrderReport){
    this.openWKO = wko;
    this.openWKO_details = wko.workOrderPrintReports;
    console.log('Open WKO', this.openWKO_details);
  }

  searchText: number = 0;
  filtered_openWKOs: WorkOrderReport[] = [];
  filterOpenWKOs(){
    this.searchText = Number(this.searchText);
    this.filtered_openWKOs = this.openWKOs.filter(x => x.workOrdersId.toString().includes(this.searchText.toString()));
    if(this.searchText == 0){
      this.filtered_openWKOs = this.openWKOs;
    }
  }

  resetOpenWKO(){
    this.openWKO = new WorkOrderReport();
    this.openWKO_details = [];
  }

  order: Orders = new Orders();
  workOrderPrintReport: WorkOrderPrintReport = new WorkOrderPrintReport();

  selectPrintReport(reportItem: WorkOrderPrintReport){
    this.workOrderPrintReport = reportItem;
    this.workOrderPrintReport.guid = Guid.newGuid();
    this.orderService.getByOrderDetailsId(reportItem.workOrderDetailsId).subscribe(result => {
      this.order = new Orders();
      this.order = result;
    });
  }

  closeWko(wkoId: number){
    this.workOrderService.closeWorkOrder(wkoId).subscribe(result => {
      this.workOrderService.getListReport().subscribe(result => {
        this.workOrderReports = result;
        this.setOpenWorkOrders();
        this.resetOpenWKO();
      });
    });
  }

  closeWkoDetail(wkoDetail: WorkOrderPrintReport){
    this.workOrderService.closeWorkOrderDetail(wkoDetail.workOrderDetailsId).subscribe(result => {
      wkoDetail.qtyclosed = wkoDetail.qtyinit;
      this.workOrderService.getListReport().subscribe(result => {
        this.workOrderReports = result;
        this.setOpenWorkOrders();
        let x = this.openWKOs.find(x => x.workOrdersId == this.openWKO.workOrdersId);
        if(x != undefined){
          this.selectOpenWKO(x);
        }
        else{
          this.resetOpenWKO();
        }
      });
    });
  }

  routingList(routing: string){
    let list = [];
    if(!this.checkStringIfEmpty(routing)){
      list = JSON.parse(routing);
    }
    return list;
  }

  bomList(bom: string){
    let list = [];
    if(!this.checkStringIfEmpty(bom)){
      list = JSON.parse(bom);
    }
    return list;
  }

  // Modal section
  closeResult = '';

  modalActive: boolean = false;

  return(value){
    return value;
  }

  modalOpen(content) {
    this.modalActive = true;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    this.modalActive = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
