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

import { NonPreciousService } from 'src/app/services/non-precious.service';
import { Nonprecious } from 'src/app/models/nonprecious.model';

import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Suppliers } from 'src/app/models/suppliers.model';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { Historylogs } from '../../models/historylogs.model';

@Component({
  selector: 'app-non-precious',
  templateUrl: './non-precious.component.html',
  styleUrls: ['./non-precious.component.scss']
})
export class NonPreciousComponent extends GenericComponent implements OnInit {

  tableCollapsed = false;
  editMode = false;

  uom: UnitOfMeasure[];
  materialCodes: MaterialCode[];
  suppliers: Suppliers[];

  nonPreciousList: Nonprecious[];
  allNonPrecious: Nonprecious[];
  nonPrecious = new Nonprecious();

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private uomService: UnitOfMeasureService,
    private materialCodeService: MaterialCodeService,
    private supplierService: SuppliersService,
    private _date: DatePipe,
    private modalService: NgbModal,
    private nonPreciousService : NonPreciousService)
  {
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
    this.setPagePermission('Non-Precious');
  }

  load() {
    forkJoin(
      [
        this.uomService.getList(),
        this.nonPreciousService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([unitOfMeasurements, nonpreciouslist, materialCodes, suppliers]) => {
        this.uom = unitOfMeasurements.responseObject;
        this.nonPreciousList = nonpreciouslist;
        this.allNonPrecious = nonpreciouslist;
        this.materialCodes = materialCodes.responseObject;
        this.suppliers = suppliers;

        return { unitOfMeasurements, nonpreciouslist, materialCodes, suppliers };
      })
    ).subscribe(response => {

      if (this.allNonPrecious.length > 0) {
        this.nonPrecious = this.allNonPrecious[0];

        this.getHistoryLog(this.nonPrecious.nonPreciousId);
      }

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  getHistoryLog(id: number) {
    this.nonPreciousService.lastupdate(id).subscribe(
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


  searchTimeout() {
    this.nonPreciousList = this.allNonPrecious.filter(
      p => p.name.toLowerCase().includes(this.searchString.toLowerCase())
        || p.sku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.supplierSku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.stockQty.toString().toLowerCase().includes(this.searchString.toLowerCase())
        || p.supplierPrice.toString().toLowerCase().includes(this.searchString.toLowerCase())
        || p.nonPreciousId.toString().toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  sortColumn = [
    { column: 'nonPreciousId', sort: '' },
    { column: 'name', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'supplierSku', sort: '' },
    { column: 'stockQty', sort: '' },
    { column: 'supplierPrice', sort: '' }
  ];

  get totalNonPrecious() {
    if (this.nonPreciousList !== undefined) {
      return this.nonPreciousList.length;
    }
    return 0;
  }

  applyColorBand(nonPrecious: Nonprecious) {
    let index = this.allNonPrecious.indexOf(nonPrecious);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  uploadProductImage(files) {

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();

    formData.append("file[]", files[0]);

    formData.append("nonPreciousId", this.nonPrecious.nonPreciousId.toString());
    formData.append("sku", this.nonPrecious.sku);

    // FUNCTION UNDER-CONTRUCTION
    this.nonPreciousService.uploadImage(formData).subscribe(
      event => {

        if (event.type === HttpEventType.UploadProgress) {
          console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
        }
        else if (event.type === HttpEventType.Response) {
          // console.log('FILE:');
          // console.log(files[0]);
          // console.log('event', event.body.responseObject[0]);

          this.nonPrecious.picPath = event.body.responseObject[0];

        }
      }, err => {
        err
      });
  }

  formatDate(iDate: Date) {

    return this._date.transform(iDate, 'MM.dd.yyyy HH:mm');
  }

  newProduct() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;
      this.newFlag = true;
      this.nonPrecious = new Nonprecious();
      this.nonPrecious.name = 'NEW_ITEM';
      this.nonPrecious.sku = 'NEW_ITEM';
      this.nonPrecious.createdBy = '';
      this.nonPrecious.createdDate = new Date();

      if (this.authService != null) {
        this.nonPrecious.createdBy = this.authService.currentUserValue.userName;
      }

      this.nonPreciousService.addupdate(this.nonPrecious).subscribe(
        res => {
          this.nonPrecious = res;

        },
        err => {
          console.log("newProduct", err)
        });
    }
    else{
      this.pagePermissionError();
    }
  }


  save() {

    this.editMode = !this.editMode;

    this.nonPreciousService.addupdate(this.nonPrecious).subscribe(
      res => {
        this.nonPrecious = res;

        // Need to recall, freaking array doesn't work
        this.nonPreciousService.getList().subscribe(res => {
          this.nonPreciousList = res;
          this.allNonPrecious = res;
        });

        this.alertService.success('Item details updated.');
      },
      err => {
        console.log("save ERROR", err)
      });

  }

  toggleEdit() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;
      this.newFlag = false;
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

    // TODO : UNDER CONSTRUCTION


    this.nonPreciousService.delete(this.nonPrecious.nonPreciousId).subscribe(
      res => {
        // console.log('DELETE NEW ITEM ', res);
        res
      },
      err => {
        console.log("newProduct", err)
      });

  }

  getNonPrecious(nonPrecious: Nonprecious) {

    this.nonPrecious = nonPrecious;

    this.getHistoryLog(nonPrecious.nonPreciousId);
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

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.nonPreciousList.sort((a, b) => {
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
      this.nonPreciousList.sort((a, b) => {
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


}

