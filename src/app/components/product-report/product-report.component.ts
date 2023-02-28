import { Component, OnInit } from '@angular/core';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { ProductInventory } from 'src/app/models/inventory-log';
import { AuthService } from 'src/app/services/auth.service';
import { InventoryLogService } from 'src/app/services/inventory-log.service';
import { ReportService } from 'src/app/services/report.service';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-product-report',
  templateUrl: './product-report.component.html',
  styleUrls: ['./product-report.component.scss']
})
export class ProductReportComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private reportService: ReportService) {
      super(authService, loadService, alertService);
      this.load();
    }

  ngOnInit(): void {
  }

  productInventory: ProductInventory[] = [];

  load(){
  }

  generateReport(){
    this.loadService.loadContent(true);
    this.reportService.generateProductInventory().subscribe(result => {
      this.loadService.loadContent(false);
      this.productInventory = result;
    }, error => {
      this.loadService.loadContent(false);
      this.alertService.error('Error generating report. (' + error + ')');
    });
  }

  loadProductMaterialInfo(id: number){
    let inventory = this.productInventory.find(x => x.productsId == id);
    if(inventory != undefined){
      if(!this.checkStringIfEmpty(inventory.materialInfoJson)){
        let materialInfo = JSON.parse(inventory.materialInfoJson);
        return materialInfo;
      }
      return '';
    }
  }
}
