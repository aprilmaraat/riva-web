import { Component, OnInit, HostListener, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { HttpEventType } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';

import { ChainfinishedService } from 'src/app/services/chainfinished.service';
import { Chainfinished, ChainfinishedInfo } from 'src/app/models/chainfinished.model';

import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Suppliers } from 'src/app/models/suppliers.model';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { Historylogs } from '../../models/historylogs.model';

@Component({
  selector: 'app-chain-finished',
  templateUrl: './chain-finished.component.html',
  styleUrls: ['./chain-finished.component.scss']
})
export class ChainFinishedComponent extends GenericComponent implements OnInit {

  tableCollapsed = false;
  editMode = false;

  uom: UnitOfMeasure[];
  materialCodes: MaterialCode[];
  suppliers: Suppliers[];

  chainfinishedList: Chainfinished[];
  allChainFinished: Chainfinished[];
  chainfinished = new Chainfinished();

  // Material and List Variables
  chainFinishedInfo: ChainfinishedInfo[];
  selectedChainFinishedInfo = new ChainfinishedInfo();
  selectedMaterialCode: number = -1;
  selectedSize = -1;
  MatList: number[];
  SizeList: number[];
  highlightSize: boolean = false;
  highlightMats: boolean = false;

  newChainFinished = new ChainfinishedInfo();
  modalMaterialCode = 0;
  modalSize = 0;

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private uomService: UnitOfMeasureService,
    private chainfinishedService: ChainfinishedService,
    private materialCodeService: MaterialCodeService,
    private supplierService: SuppliersService,
    private _date: DatePipe,
    private modalService: NgbModal) {
    super(authService, loadService, alertService);
    this.loadService.loadContent(true);
    this.load();
  }

  tableActive = false;
  selectedUOM = 1;
  newFlag = false;
  lastUpdated = new Historylogs();

  @ViewChild('uploadImage') imageUploader: ElementRef;

  ngOnInit(): void {
    this.loadService.loadContent(false);
    this.setPagePermission('Chain');
  }

  load() {
    forkJoin(
      [
        this.uomService.getList(),
        this.chainfinishedService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([unitOfMeasurements, chainlist, materialCodes, suppliers]) => {
        this.uom = unitOfMeasurements.responseObject;
        this.chainfinishedList = chainlist;
        this.allChainFinished = chainlist;
        this.materialCodes = materialCodes.responseObject;
        this.suppliers = suppliers;

        return { unitOfMeasurements, chainlist, materialCodes, suppliers };
      })
    ).subscribe(response => {

      if (this.allChainFinished.length > 0) {
        this.chainfinished = this.allChainFinished[0];

        if (this.chainfinished.chainFinishedInfo.length > 0) {
          this.chainFinishedInfo = this.chainfinished.chainFinishedInfo;

          this.getMaterialList();
        }


        this.getHistoryLog(this.chainfinished.chainFinishedId);
      }

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  getHistoryLog(id: number) {
    this.chainfinishedService.lastupdate(id).subscribe(
      res => {
        this.lastUpdated = res;

        if (this.lastUpdated != null) {
          this.lastUpdated = res;
        }
        else {
          this.lastUpdated = new Historylogs();
        }

        // console.log('this.lastUpdated', this.lastUpdated)
      },
      err => {
        console.log("getHistoryLog ERROR", err);
      });
  }


  getMaterialList() {

    if (this.chainFinishedInfo.length > 0) {
      this.MatList = this.chainFinishedInfo.map(x => parseInt(x.materialCodeId.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      this.SizeList = this.chainFinishedInfo.map(x => parseInt(x.size.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      if (this.MatList.length > 0 && this.SizeList.length > 0) {
        this.selectedSize = parseInt(this.chainFinishedInfo[0].size);
        this.selectedMaterialCode = this.chainFinishedInfo[0].materialCodeId;

        this.highlightMaterials(this.selectedSize);
        this.highlightSizes(this.selectedMaterialCode);

        this.getSelectedChainFinishedInfo();
      }



    }
    else {
      this.selectedSize = -1;
      this.selectedMaterialCode = 0;
      this.selectedChainFinishedInfo = new ChainfinishedInfo();
      this.MatList = [];
      this.SizeList = [];
    }

  }

  getSelectedChainFinishedInfo() {

    this.selectedChainFinishedInfo = new ChainfinishedInfo();

    if (this.selectedMaterialCode != 0 && this.selectedSize != -1) {

      this.selectedChainFinishedInfo = this.chainFinishedInfo.filter(x => x.materialCodeId == this.selectedMaterialCode
        && parseInt(x.size) == this.selectedSize)[0];

      if (this.selectedChainFinishedInfo == undefined) {
        this.selectedChainFinishedInfo = new ChainfinishedInfo();
      }

    }

  }

  highlightMaterials(size: number) {

    if (this.selectedMaterialCode !== 0) {

      //  var materials = this.lstMatCodeSize.filter(mat => mat.matID == this.productDetails.matID);
      var materials = this.chainFinishedInfo.filter(info => info.materialCodeId == this.selectedMaterialCode);

      if (materials !== undefined) {

        var filtered = materials.find(mat => mat.size.toString() == size.toString());

        if (filtered !== undefined) {

          this.highlightMats = true;

          return true;
        }
      }
    }

    return false;
  }


  highlightSizes(materialCodeId: number) {

    if (this.chainFinishedInfo.length > 0 && this.selectedSize != -1) {

      var sizes = this.chainFinishedInfo.find(x => parseInt(x.size) === this.selectedSize);

      if (sizes !== undefined) {

        this.highlightSize = true;

        return true;
      }

    }

    return false;
  }

  get totalChainFinished() {
    if (this.chainfinishedList !== undefined) {
      return this.chainfinishedList.length;
    }
    return 0;
  }

  searchString = '';

  searchTimeout() {
    this.chainfinishedList = this.allChainFinished.filter(
      p => p.name.toLowerCase().includes(this.searchString.toLowerCase())
        || p.sku.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  sortColumn = [
    { column: 'chainFinishedId', sort: '' },
    { column: 'name', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'suppliersId', sort: '' }
  ];

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.chainfinishedList.sort((a, b) => {
        if (a[column] > b[column]) {
          return 1;
        }
        if (a[column] < b[column]) {
          return -1;
        }
        return 0;
      });
    }
    else {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'desc';
      this.chainfinishedList.sort((a, b) => {
        if (a[column] < b[column]) {
          return 1;
        }
        if (a[column] > b[column]) {
          return -1;
        }
        return 0;
      });
    }
  }

  sortClass(column) {
    if (this.sortColumn.find(s => s.column === column).sort === 'asc') {
      return 'fa-arrow-up';
    }
    else if (this.sortColumn.find(s => s.column === column).sort === 'desc') {
      return 'fa-arrow-down';
    }
    return '';
  }

  applyColorBand(chainFinished: Chainfinished) {
    let index = this.allChainFinished.indexOf(chainFinished);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  getFinding(chainfinished: Chainfinished) {

    this.chainfinished = chainfinished;

    this.chainFinishedInfo = [];

    if (this.chainfinished.chainFinishedInfo.length > 0) {
      this.chainFinishedInfo = this.chainfinished.chainFinishedInfo;
    }

    this.getMaterialList();

    this.getHistoryLog(chainfinished.chainFinishedId);
  }

  toggleEdit() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;
      this.newFlag = false;
      this.getMaterialList();
    }
    else{
      this.pagePermissionError();
    }
  }

  toggleCancel() {
    this.editMode = !this.editMode;

    if (this.newFlag == false) {
      return;
    }

    this.getMaterialList();

    this.chainfinishedService.delete(this.chainfinished.chainFinishedId).subscribe(
      res => {
        // console.log('DELETE NEW ITEM ', res);
        res
      },
      err => {
        console.log("newProduct", err)
      });

  }

  save() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;

      this.chainfinished.chainFinishedInfo = [];
      this.chainfinished.chainFinishedInfo = this.chainFinishedInfo;

      this.chainfinishedService.addupdate(this.chainfinished).subscribe(
        res => {
          this.chainfinished = res;

          this.getHistoryLog(this.chainfinished.chainFinishedId);

          // Need to recall, freaking array doesn't work
          this.chainfinishedService.getList().subscribe(res => {
            this.chainfinishedList = res;
            this.allChainFinished = res;
          });

          this.alertService.success('item details updated.');
        },
        err => {
          console.log("save ERROR", err)
        });
    }
    else{
      this.pagePermissionError();
    }
  }

  newProduct() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;

      this.newFlag = true;

      this.chainfinished = new Chainfinished();
      this.chainfinished.name = 'NEW_ITEM';
      this.chainfinished.sku = 'NEW_ITEM';
      this.chainfinished.createdBy = '';
      this.chainfinished.createdDate = new Date();

      this.chainFinishedInfo = [];

      if (this.authService != null) {
        this.chainfinished.createdBy = this.authService.currentUserValue.userName;
      }

      this.chainfinishedService.addupdate(this.chainfinished).subscribe(
        res => {
          this.chainfinished = res;

        },
        err => {
          console.log("newProduct", err)
        });

      this.getMaterialList();
    }
    else{
      this.pagePermissionError();
    }
  }


  uploadProductImage(files) {

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();

    formData.append("file[]", files[0]);

    formData.append("chainfinishedId", this.chainfinished.chainFinishedId.toString());
    formData.append("sku", this.chainfinished.sku);

    // FUNCTION UNDER-CONTRUCTION
    this.chainfinishedService.uploadImage(formData).subscribe(
      event => {

        if (event.type === HttpEventType.UploadProgress) {
          console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
        }
        else if (event.type === HttpEventType.Response) {
          // console.log('FILE:');
          // console.log(files[0]);
          // console.log('event', event.body.responseObject[0]);

          this.chainfinished.picPath = event.body.responseObject[0];

        }
      }, err => {
        err
      });
  }

  formatDate(iDate: Date) {

    return this._date.transform(iDate, 'MM.dd.yyyy HH:mm');
  }

  getMaterialDesc(matId: number): string {

    let materialCode = new MaterialCode();
    let desc = '';

    materialCode = this.materialCodes.filter(x => x.materialCodeId == matId)[0];

    if (materialCode != undefined) {
      desc = materialCode.description;
    }

    return desc;
  }

  // Modal
  createMatSizeOpen(content) {

    this.modalOpen(content);
  }

  closeResult = '';

  modalOpen(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      // Add New Info
      this.AddNewChainFinishedInfo();

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  AddNewChainFinishedInfo() {
    this.newChainFinished = new ChainfinishedInfo();
    this.newChainFinished.chainFinishedInfoId = 0;
    this.newChainFinished.chainFinishedId = this.chainfinished.chainFinishedId;
    this.newChainFinished.size = this.modalSize.toString();
    this.newChainFinished.materialCodeId = this.modalMaterialCode;

    this.newChainFinished.stockQty = 0;
    this.newChainFinished.supplierSku = "";
    this.newChainFinished.supplierPrice = 0;

    if (this.chainFinishedInfo != undefined && this.chainFinishedInfo.length > 0) {
      let index = this.chainFinishedInfo.findIndex(d => d.materialCodeId.toString() == this.modalMaterialCode.toString()
              && d.size == this.modalSize.toString());

      if (index == -1) {
        this.chainFinishedInfo.push(this.newChainFinished);
      }
      else {
        this.alertService.error("Existing Material and size combination exist!");
      }
    }
    else {
      this.chainFinishedInfo = [];
      this.chainFinishedInfo.push(this.newChainFinished);
    }

    this.getMaterialList();
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getSupplierName(supplierId: number) {
    return this.suppliers.filter(x => x.suppliersId == supplierId)[0].companyName;
  }





}
