import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { Enamel } from 'src/app/models/enamel';
import { Suppliers } from 'src/app/models/suppliers.model';
import { AuthService } from 'src/app/services/auth.service';
import { EnamelService } from 'src/app/services/enamel.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-enamel',
  templateUrl: './enamel.component.html',
  styleUrls: ['./enamel.component.scss']
})
export class EnamelComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private enamelService: EnamelService
    , private supplierService: SupplierService) {
      super(authService, loadService, alertService);
      this.load();
    }

  ngOnInit(): void {
    this.setPagePermission('Enamel');
  }

  enamels: Enamel[] = [];
  suppliers: Suppliers[] = [];

  load(){
    this.loadService.loadContent(true);
    this.enamel = new Enamel();

    forkJoin(
      [
        this.enamelService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([enamelList, supplierList]) => {
        let enamelsResult = enamelList;
        let suppliersResult = supplierList;
        return { enamelsResult, suppliersResult };
      })
    ).subscribe(data => {
      this.enamels = data.enamelsResult;
      this.filteredEnamels = this.enamels;
      if(this.filteredEnamels.length != 0){
        this.selectItem(this.filteredEnamels[0]);
      }
      this.suppliers = data.suppliersResult;
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
    });
  }

  searchString = '';
  filteredEnamels: Enamel[] = [];

  searchTimeout(){
    this.filteredEnamels = this.enamels.filter(
      e => e.enamelSku.toLowerCase().includes(this.searchString.toLowerCase()) 
      || e.enamelName.toLowerCase().includes(this.searchString.toLowerCase()) 
      || e.pantoneColor.toLowerCase().includes(this.searchString.toLowerCase())
      || e.colorHex.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  enamel: Enamel = new Enamel();

  selectItem(enamel: Enamel) {
    if(!this.editMode){
      this.enamel.enamelId = enamel.enamelId;
      this.enamel.enamelSku = enamel.enamelSku;
      this.enamel.enamelName = enamel.enamelName;
      this.enamel.pantoneColor = enamel.pantoneColor;
      this.enamel.hardness = enamel.hardness;
      this.enamel.colorHex = enamel.colorHex;
      this.enamel.supplierId = enamel.supplierId;
    }
  }

  editMode: boolean = false;

  toggleEdit(edit: boolean){
    if(this.isAuthorized){
      this.editMode = edit;
    }
    else{
      this.pagePermissionError();
    }
  }

  save(){
    if(this.isAuthorized){
      this.enamelService.post(this.enamel, '').subscribe(result => {
        this.load();
        this.editMode = false;
      });
    }
    else{
      this.pagePermissionError();
    }
  }

  cancelChanges(){
    this.enamel = new Enamel();
    this.enamels = [];
    this.filteredEnamels = [];
    this.editMode = false;
    this.load();
  }

  new(){
    if(this.isAuthorized){
      this.enamel = new Enamel();
      this.editMode = true;
    }
    else{
      this.pagePermissionError();
    }
  }

  supplierName(supplierId: number){
    if(this.suppliers.length != 0){
      let data = this.suppliers.find(x => x.suppliersId == supplierId);
      if(data != undefined){
        let supplierName = '(' + data.supplierId + ') ' + data.companyName;
        return supplierName;
      }
    }
    return '-ERROR-';
  }
  
  applyColorBand(enamel: Enamel) {
    let index = this.enamels.indexOf(enamel);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }
}
