  import { Component, OnInit } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { InventoryLogService } from 'src/app/services/inventory-log.service';
import { InventoryLog } from 'src/app/models/inventory-log';
import { unescapeIdentifier } from '@angular/compiler';

@Component({
  templateUrl: './inventory-log.component.html',
  styleUrls: ['./inventory-log.component.scss']
})
export class InventoryLogComponent extends GenericComponent implements OnInit {
  inventoryLogs: InventoryLog[];
  newTotalEditable = true;
  wkoID: number;
  uom: string;
  gramsPerUnit: number;

  inventory: InventoryLog = new InventoryLog;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private inventoryLogService: InventoryLogService) { 
      super(authService, loadService, alertService);
    }

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable(){
    // this.loadService.loadContent(true);
    this.inventoryLogService.getList().subscribe(response => {
      this.inventoryLogs = response;
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error);
      this.loadService.loadContent(false);
    });
  }

  getScannerData(){
    let param = this.inventory.barcodeId;

    if(param !== undefined){
      this.loadService.loadContent(true);
      this.inventoryLogService.getScannerData(param).subscribe(response => {
        this.mapResponse(response);
        this.alertService.clear();
        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });
    }
    
  }

  getScannerDataItemNo(){
     let param = this.inventory.itemNo;

    if(param !== undefined){
      this.loadService.loadContent(true);
      this.inventoryLogService.getScannerDataItemNo(this.inventory).subscribe(response => {
        this.mapResponse(response);
        this.alertService.clear();
        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });
    }
    
  }

  getScannerDataWKO() {
    let param = this.wkoID.toString().replace('e', '').replace('E', '');

    ///alert(param);

    if(param !== undefined){
      this.loadService.loadContent(true);
      this.inventoryLogService.getScannerDataWKO(param).subscribe(response => {
        this.mapResponsewKO(response);
        this.alertService.clear();
        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });
    }
    
  }

  addInventoryLog(){
    let inventoryLog = this.inventory;
    this.inventoryLogService.addInventoryLog(inventoryLog).subscribe(response => {
      this.alertService.clear();
      this.loadTable();
      this.inventory = new InventoryLog();
      this.wkoID = 0;
      this.alertService.success(response.messageText);

    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  newTotalToggle(){
    this.newTotalEditable = !this.newTotalEditable;
  }

  updateNewTotal(){
    if(this.inventory.qtyNew !== undefined && this.gramsPerUnit)
      this.inventory.gramWgtNew = this.inventory.qtyNew * this.gramsPerUnit;
  }

  mapResponse(response: any){
    console.log(response);
    this.inventory.barcodeId = response.barcodeId;
    this.inventory.itemType = response.inventoryType;
    this.inventory.itemNo = response.itemNo;
    this.inventory.karat = response.karat;
    this.uom = response.iuom;
    this.gramsPerUnit = response.gramsPerUnit;
    this.inventory.qtyOld = response.oldWtg;
    this.inventory.gramWgtOld = response.oldWtgTotal;
    this.wkoID = response.idwko;
    if(this.inventory.qtyNew !== undefined)
      this.inventory.gramWgtNew = this.inventory.qtyNew * this.gramsPerUnit;
    else{
      this.inventory.qtyNew = undefined;
      this.inventory.gramWgtNew = undefined;
    }

    if (this.authService.currentUserValue != undefined) {
      this.inventory.webUser = this.authService.currentUserValue.userName;
    }

  }

  mapResponsewKO(response: any) {
    console.log(response);
    this.inventory.barcodeId = response.idwko;
    this.inventory.itemType = response.inventoryType;
    this.inventory.itemNo = response.itemNo;
    this.inventory.karat = response.karat;
    this.uom = response.iuom;
    this.gramsPerUnit = response.gramsPerUnit;
    this.inventory.qtyOld = response.oldWtg;
    this.inventory.gramWgtOld = response.oldWtgTotal;
    this.wkoID = response.idwko;
    if (this.inventory.qtyNew !== undefined)
      this.inventory.gramWgtNew = this.inventory.qtyNew * this.gramsPerUnit;
    else {
      this.inventory.qtyNew = undefined;
      this.inventory.gramWgtNew = undefined;
    }

    if (this.authService.currentUserValue != undefined) {
      this.inventory.webUser = this.authService.currentUserValue.userName;
    }
  }

  setInventoryLog(selected : InventoryLog) {
    let selectedInventory = new InventoryLog();

    // NOTE : Cannot assign object to object as it is binded on the table
    selectedInventory.barcodeId = selected.barcodeId;
    selectedInventory.itemType = selected.itemType;
    selectedInventory.itemNo = selected.itemNo;
    selectedInventory.karat = selected.karat;
    selectedInventory.entryDate = selected.entryDate;
    selectedInventory.qtyOld = selected.qtyOld;
    selectedInventory.qtyNew = selected.qtyNew;
    selectedInventory.gramWgtOld = selected.gramWgtOld;
    selectedInventory.gramWgtNew = selected.gramWgtNew;

    selectedInventory.id = 0
    if (this.authService.currentUserValue != undefined) {
      selectedInventory.webUser = this.authService.currentUserValue.userName;
    }

    this.inventory = selectedInventory;

  }
}
