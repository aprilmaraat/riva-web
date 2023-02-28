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


import { RawMaterialsService } from 'src/app/services/raw-materials.service';
import { RawmaterialsinfoService } from 'src/app/services/rawmaterialsinfo.service';
import { RawMaterials, Rawmaterialsinfo } from 'src/app/models/raw-materials.model';
import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Suppliers } from 'src/app/models/suppliers.model';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { Historylogs } from '../../models/historylogs.model';



@Component({
  selector: 'app-raw-materials',
  templateUrl: './raw-materials.component.html',
  styleUrls: ['./raw-materials.component.scss']
})
export class RawMaterialsComponent extends GenericComponent implements OnInit {

  tableCollapsed = false;
  editMode = false;

  uom: UnitOfMeasure[];
  materialCodes: MaterialCode[];
  suppliers: Suppliers[];

  rawMaterials: RawMaterials[];
  allrawMaterials: RawMaterials[];
  rawMaterial = new RawMaterials();

  // Material and List Variables
  rawMaterialsInfo: Rawmaterialsinfo[];
  selectedRawMaterialsInfo = new Rawmaterialsinfo();
  selectedMaterialCode: number = -1;
  selectedSize = -1;
  MatList: number[];
  SizeList: number[];
  highlightSize: boolean = false;
  highlightMats: boolean = false;

  newRawMaterialsInfo = new Rawmaterialsinfo();
  modalMaterialCode = 0;
  modalSize = 0;

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private uomService: UnitOfMeasureService,
    private rawmaterialsService: RawMaterialsService,
    private materialCodeService: MaterialCodeService,
    private supplierService: SuppliersService,
    private rawMaterialsInfoService: RawmaterialsinfoService,
    private _date: DatePipe,
    private modalService: NgbModal)
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
  }
  load() {
    forkJoin(
      [
        this.uomService.getList(),
        this.rawmaterialsService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([unitOfMeasurements, rawMaterials, materialCodes, suppliers]) => {
        this.uom = unitOfMeasurements.responseObject;
        this.rawMaterials = rawMaterials;
        this.allrawMaterials = rawMaterials;
        this.materialCodes = materialCodes.responseObject;
        this.suppliers = suppliers;

        return { unitOfMeasurements, rawMaterials, materialCodes, suppliers };
      })
    ).subscribe(response => {

      if (this.allrawMaterials.length > 0) {
        this.rawMaterial = this.allrawMaterials[0];

        if (this.rawMaterial.rawMaterialsInfo.length > 0) {
          this.rawMaterialsInfo = this.rawMaterial.rawMaterialsInfo;

          this.getMaterialList();
        }


        this.getHistoryLog(this.rawMaterial.rawMaterialsId);
      }

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  get totalRawMaterials() {
    if (this.rawMaterials !== undefined) {
      return this.rawMaterials.length;
    }
    return 0;
  }

  searchString = '';

  searchTimeout() {
    this.rawMaterials = this.allrawMaterials.filter(
      p => p.name.toLowerCase().includes(this.searchString.toLowerCase())
        || p.sku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.supplierSku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.stockLocation.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  sortColumn = [
    { column: 'rawMaterialsId', sort: '' },
    { column: 'name', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'supplierSku', sort: '' },
    { column: 'uom', sort: '' },
    { column: 'qtyStock', sort: '' },
    { column: 'stockLocation', sort: '' }
  ];

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.rawMaterials.sort((a, b) => {
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
      this.rawMaterials.sort((a, b) => {
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

  applyColorBand(rawmaterial: RawMaterials) {
    let index = this.rawMaterials.indexOf(rawmaterial);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  getRawMaterial(rawMaterial: RawMaterials) {

    this.rawMaterial = rawMaterial;

    this.getHistoryLog(rawMaterial.rawMaterialsId);
  }

  toggleEdit() {
    this.editMode = !this.editMode;

    this.newFlag = false;

  }


  toggleCancel() {
    this.editMode = !this.editMode;

    if (this.newFlag == false) {
      return;
    }

    this.rawmaterialsService.delete(this.rawMaterial.rawMaterialsId).subscribe(
      res => {
        // console.log('DELETE NEW ITEM ', res);
        res
      },
      err => {
        console.log("newProduct", err)
      });

  }

  save() {

    this.editMode = !this.editMode;

    this.rawMaterial.rawMaterialsInfo = [];
    this.rawMaterial.rawMaterialsInfo = this.rawMaterialsInfo;

    this.rawmaterialsService.addupdate(this.rawMaterial).subscribe(
      res => {
        this.rawMaterial = res;

        // Need to recall, freaking array doesn't work
        this.rawmaterialsService.getList().subscribe(res => {
          this.rawMaterials = res;
          this.allrawMaterials = res;
        });

        this.alertService.success('product details updated.');
      },
      err => {
        console.log("save ERROR", err)
      });

  }

  newProduct() {

    this.editMode = !this.editMode;

    this.newFlag = true;

    this.rawMaterial = new RawMaterials();
    this.rawMaterial.name = 'NEW_ITEM';
    this.rawMaterial.sku = 'NEW_ITEM';
    this.rawMaterial.createdBy = '';
    this.rawMaterial.createdDate = new Date();

    this.rawmaterialsService.addupdate(this.rawMaterial).subscribe(
      res =>
      {
        this.rawMaterial = res;

        // console.log('NEW ITEM CREATED', this.rawMaterial);
      },
      err => {
      console.log("newProduct", err)
    });
  }

  uploadProductImage(files) {

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();

    formData.append("file[]", files[0]);

    formData.append("rawMaterialsId", this.rawMaterial.rawMaterialsId.toString());
    formData.append("sku", this.rawMaterial.sku);

    // FUNCTION UNDER-CONTRUCTION
    this.rawmaterialsService.uploadImage(formData).subscribe(
      event => {

        if (event.type === HttpEventType.UploadProgress) {
          console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
        }
        else if (event.type === HttpEventType.Response) {
          // console.log('FILE:');
          // console.log(files[0]);
          // console.log('event', event.body.responseObject[0]);

          this.rawMaterial.picPath = event.body.responseObject[0];

        }
      }, err => {
        err
      });
  }

  getHistoryLog(id: number) {
    this.rawmaterialsService.lastupdate(id).subscribe(
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

  getSelectedRawMaterialsInfo() {

    this.selectedRawMaterialsInfo = new Rawmaterialsinfo();

    if (this.selectedMaterialCode != 0 && this.selectedSize != -1) {

      this.selectedRawMaterialsInfo = this.rawMaterialsInfo.filter(x => x.materialCodeId == this.selectedMaterialCode
        && parseInt(x.size) == this.selectedSize)[0];

      if (this.selectedRawMaterialsInfo == undefined) {
        this.selectedRawMaterialsInfo = new Rawmaterialsinfo();
      }

    }

  }

  getMaterialList() {

    if (this.rawMaterialsInfo.length > 0) {
      this.MatList = this.rawMaterialsInfo.map(x => parseInt(x.materialCodeId.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      this.SizeList = this.rawMaterialsInfo.map(x => parseInt(x.size.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      if (this.MatList.length > 0 && this.SizeList.length > 0) {
        this.selectedSize = parseInt(this.rawMaterialsInfo[0].size);
        this.selectedMaterialCode = this.rawMaterialsInfo[0].materialCodeId;
        
        this.highlightMaterials(this.selectedSize);
        this.highlightSizes(this.selectedMaterialCode);

        this.getSelectedRawMaterialsInfo();
      }



    }
    else {
      this.selectedSize = -1;
      this.selectedMaterialCode = 0;
      this.selectedRawMaterialsInfo = new Rawmaterialsinfo();
      this.MatList = [];
      this.SizeList = [];
    }

  }

  highlightMaterials(size: number) {

    if (this.selectedMaterialCode !== 0) {

      //  var materials = this.lstMatCodeSize.filter(mat => mat.matID == this.productDetails.matID);
      var materials = this.rawMaterialsInfo.filter(info => info.materialCodeId == this.selectedMaterialCode);

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

    if (this.rawMaterialsInfo.length > 0 && this.selectedSize != -1) {

      var sizes = this.rawMaterialsInfo.find(x => parseInt(x.size) === this.selectedSize);

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
      this.AddNewRawMaterialInfo();

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  AddNewRawMaterialInfo() {
    this.newRawMaterialsInfo = new Rawmaterialsinfo();
    this.newRawMaterialsInfo.rawMaterialsInfoId = 0;
    this.newRawMaterialsInfo.rawMaterialsId = this.rawMaterial.rawMaterialsId;
    this.newRawMaterialsInfo.size = this.modalSize.toString();
    this.newRawMaterialsInfo.materialCodeId = this.modalMaterialCode;

    this.newRawMaterialsInfo.stockQty = 0;
    this.newRawMaterialsInfo.weight = 0;


    let index = this.rawMaterialsInfo.findIndex(d => d.materialCodeId.toString() == this.modalMaterialCode.toString() && d.size == this.modalSize.toString());

    if (index == -1) {
      this.rawMaterialsInfo.push(this.newRawMaterialsInfo);
    }
    else {
      this.alertService.error("Existing Material and size combination exist!");
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





}
