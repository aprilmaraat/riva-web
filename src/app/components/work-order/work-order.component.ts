import { Component, OnInit } from '@angular/core';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { Orders } from 'src/app/models/orders.model';
import { WorkOrderPrintReport } from 'src/app/models/work-order';
import { AuthService } from 'src/app/services/auth.service';
import { InventoryLogService } from 'src/app/services/inventory-log.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private reportService: ReportService
    , private orderService: OrderService) {
      super(authService, loadService, alertService);
      this.load();
    }

  ngOnInit(): void {
  }

  selectedOrderId: number = 0;
  orders: Orders[] = [];


  load(){
    this.orderService.getList().subscribe(result => {
      this.orders = result;
    });
  }

  order: Orders = new Orders();
  workOrders: WorkOrderPrintReport[] = [];
  test_workOrder: WorkOrderPrintReport = new WorkOrderPrintReport();

  generateReport(){
    if(this.selectedOrderId > 0){
      this.workOrders = [];
      this.loadService.loadContent(true);

      this.orderService.getOrderById(this.selectedOrderId).subscribe(result => {
        this.order = result;
        this.reportService.generateWorkOrder(this.selectedOrderId).subscribe(result => {
          this.loadService.loadContent(false);
          this.workOrders = result;
          this.test_workOrder = this.workOrders[0];
          console.log(this.test_workOrder);
        }, error => {
          this.loadService.loadContent(false);
          this.alertService.error('Error generating report. (' + error + ')');
        });
      });
    }
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

}
