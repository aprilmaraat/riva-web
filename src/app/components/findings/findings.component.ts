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

import { FindingsService } from 'src/app/services/findings.service';
import { Findings, FindingsInfo } from 'src/app/models/findings.model';

import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Suppliers } from 'src/app/models/suppliers.model';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { Historylogs } from '../../models/historylogs.model';

@Component({
  selector: 'app-findings',
  templateUrl: './findings.component.html',
  styleUrls: ['./findings.component.scss']
})
export class FindingsComponent extends GenericComponent implements OnInit {

  tableCollapsed = false;
  editMode = false;

  uom: UnitOfMeasure[];
  materialCodes: MaterialCode[];
  suppliers: Suppliers[];

  findings: Findings[];
  allfindings: Findings[];
  finding = new Findings();

  // Material and List Variables
  findingsInfo: FindingsInfo[];
  selectedFindingsInfo = new FindingsInfo();
  selectedMaterialCode: number = -1;
  selectedSize = "";
  MatList: number[];
  SizeList: string[];
  highlightSize: boolean = false;
  highlightMats: boolean = false;

  newFindingsInfo = new FindingsInfo();
  modalMaterialCode = 0;
  modalSize = 0;

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private uomService: UnitOfMeasureService,
    private findingsService: FindingsService,
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
    this.setPagePermission('Findings');
  }


  load() {
    forkJoin(
      [
        this.uomService.getList(),
        this.findingsService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([unitOfMeasurements, findings, materialCodes, suppliers]) => {
        this.uom = unitOfMeasurements.responseObject;
        this.findings = findings;
        this.allfindings = findings;
        this.materialCodes = materialCodes.responseObject;
        this.suppliers = suppliers;

        return { unitOfMeasurements, findings, materialCodes, suppliers };
      })
    ).subscribe(response => {

      if (this.allfindings.length > 0) {
        this.finding = this.allfindings[0];

        if (this.finding.findingsInfo.length > 0) {
          this.findingsInfo = this.finding.findingsInfo;

          this.getMaterialList();
        }


        this.getHistoryLog(this.finding.findingsId);
      }

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  get totalFindings() {
    if (this.findings !== undefined) {
      return this.findings.length;
    }
    return 0;
  }

  searchString = '';

  searchTimeout() {
    this.findings = this.allfindings.filter(
      p => p.name.toLowerCase().includes(this.searchString.toLowerCase())
        || p.sku.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  sortColumn = [
    { column: 'findingsId', sort: '' },
    { column: 'name', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'suppliersId', sort: '' }
  ];

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.findings.sort((a, b) => {
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
      this.findings.sort((a, b) => {
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

  applyColorBand(finding: Findings) {
    let index = this.allfindings.indexOf(finding);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  getFinding(finding: Findings) {

    this.finding = finding;

    this.findingsInfo = [];

    if (this.finding.findingsInfo.length > 0) {
      this.findingsInfo = this.finding.findingsInfo;
    }

    this.getMaterialList();

    this.getHistoryLog(finding.findingsId);
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

    this.findingsService.delete(this.finding.findingsId).subscribe(
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

      this.finding.findingsInfo = [];
      this.finding.findingsInfo = this.findingsInfo;

      this.findingsService.addupdate(this.finding).subscribe(res => {
        this.finding = res;

        // Need to recall, freaking array doesn't work
        this.findingsService.getList().subscribe(res => {
          this.findings = res;
          this.allfindings = res;
        });

        this.alertService.success('product details updated.');
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

      this.finding = new Findings();
      this.finding.name = 'NEW_ITEM';
      this.finding.sku = 'NEW_ITEM';
      this.finding.createdBy = '';
      this.finding.createdDate = new Date();

      this.findingsInfo = [];

      if (this.authService != null) {
        this.finding.createdBy = this.authService.currentUserValue.userName;
      }

      this.findingsService.addupdate(this.finding).subscribe(
        res => {
          this.finding = res;

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

    formData.append("findingsId", this.finding.findingsId.toString());
    formData.append("sku", this.finding.sku);

    // FUNCTION UNDER-CONTRUCTION
    this.findingsService.uploadImage(formData).subscribe(
      event => {

        if (event.type === HttpEventType.UploadProgress) {
          console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
        }
        else if (event.type === HttpEventType.Response) {
          // console.log('FILE:');
          // console.log(files[0]);
          // console.log('event', event.body.responseObject[0]);

          this.finding.picPath = event.body.responseObject[0];

        }
      }, err => {
        err
      });
  }

  getHistoryLog(id: number) {
    this.findingsService.lastupdate(id).subscribe(
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

  formatDate(iDate: Date) {

    return this._date.transform(iDate, 'MM.dd.yyyy HH:mm');
  }


  // Material and sizes -- codes ***************************************** -- START
  getMaterialDesc(matId: number): string {

    let materialCode = new MaterialCode();
    let desc = '';

    materialCode = this.materialCodes.filter(x => x.materialCodeId == matId)[0];

    if (materialCode != undefined) {
      desc = materialCode.description;
    }

    return desc;
  }

  getSelectedFindingsInfo() {

    this.selectedFindingsInfo = new FindingsInfo();

    if (this.selectedMaterialCode != 0 && this.selectedSize != "") {

      this.selectedFindingsInfo = this.findingsInfo.filter(x => x.materialCodeId == this.selectedMaterialCode
        && x.size == this.selectedSize)[0];

      if (this.selectedFindingsInfo == undefined) {
        this.selectedFindingsInfo = new FindingsInfo();
      }

    }

  }

  getMaterialList() {

    if (this.findingsInfo.length > 0) {
      this.MatList = this.findingsInfo.map(x => parseInt(x.materialCodeId.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      this.SizeList = this.findingsInfo.map(x => x.size)
        .filter((value, index, self) => self.indexOf(value) === index);

      if (this.MatList.length > 0 && this.SizeList.length > 0) {
        this.selectedSize = this.findingsInfo[0].size;
        this.selectedMaterialCode = this.findingsInfo[0].materialCodeId;

        this.highlightMaterials(this.selectedSize);
        this.highlightSizes(this.selectedMaterialCode);

        this.getSelectedFindingsInfo();
      }



    }
    else {
      this.selectedSize = "";
      this.selectedMaterialCode = 0;
      this.selectedFindingsInfo = new FindingsInfo();
      this.MatList = [];
      this.SizeList = [];
    }

  }

  highlightMaterials(size: string) {

    if (this.selectedMaterialCode !== 0) {

      //  var materials = this.lstMatCodeSize.filter(mat => mat.matID == this.productDetails.matID);
      var materials = this.findingsInfo.filter(info => info.materialCodeId == this.selectedMaterialCode);

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

    if (this.findingsInfo.length > 0 && this.selectedSize != "") {

      var sizes = this.findingsInfo.find(x => x.size === this.selectedSize);

      if (sizes !== undefined) {

        this.highlightSize = true;

        return true;
      }

    }

    return false;
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
      this.AddNewFindingsInfo();

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  AddNewFindingsInfo() {
    this.newFindingsInfo = new FindingsInfo();
    this.newFindingsInfo.findingsInfoId = 0;
    this.newFindingsInfo.findingsId = this.finding.findingsId;
    this.newFindingsInfo.size = this.modalSize.toString();
    this.newFindingsInfo.materialCodeId = this.modalMaterialCode;

    this.newFindingsInfo.stockQty = 0;
    this.newFindingsInfo.weight = 0;

    if (this.findingsInfo != undefined && this.findingsInfo.length > 0 ) {
      let index = this.findingsInfo.findIndex(d => d.materialCodeId.toString() == this.modalMaterialCode.toString() && d.size == this.modalSize.toString());

      if (index == -1) {
        this.findingsInfo.push(this.newFindingsInfo);
      }
      else {
        this.alertService.error("Existing Material and size combination exist!");
      }
    }
    else {
      this.findingsInfo = [];
      this.findingsInfo.push(this.newFindingsInfo);
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
