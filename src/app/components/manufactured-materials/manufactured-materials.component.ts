import { Component, OnInit, HostListener, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { HttpEventType } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { GenericComponent, Guid } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';

import { ManufacturedMaterialsService } from 'src/app/services/manufactured-materials.service';
import { ManufacturedMaterials, ManufacturedMaterialsInfo } from 'src/app/models/manufactured-materials';

import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Suppliers } from 'src/app/models/suppliers.model';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { Historylogs } from '../../models/historylogs.model';

@Component({
  selector: 'app-manufactured-materials',
  templateUrl: './manufactured-materials.component.html',
  styleUrls: ['./manufactured-materials.component.scss']
})
export class ManufacturedMaterialsComponent extends GenericComponent implements OnInit {

  tableCollapsed = false;
  editMode = false;

  uom: UnitOfMeasure[];
  materialCodes: MaterialCode[];
  suppliers: Suppliers[];

  manufacturedMats: ManufacturedMaterials[];
  allManufacturedMats: ManufacturedMaterials[];
  manufacturedMat = new ManufacturedMaterials();

  // Material and List Variables
  manufacturedMatsInfo: ManufacturedMaterialsInfo[];
  selectedManufacturedMatsInfo = new ManufacturedMaterialsInfo();
  selectedMaterialCode: number = -1;
  selectedSize = "";
  MatList: number[];
  SizeList: string[];
  highlightSize: boolean = false;
  highlightMats: boolean = false;

  newManufacturedMatsInfo = new ManufacturedMaterialsInfo();
  modalMaterialCode = 0;
  modalSize = 0;

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private uomService: UnitOfMeasureService,
    private manufacturedMatsService: ManufacturedMaterialsService,
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

  ngOnInit(): void {
    this.loadService.loadContent(false);
    this.setPagePermission('Manufactured Materials');
  }


  load() {
    forkJoin(
      [
        this.uomService.getList(),
        this.manufacturedMatsService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([unitOfMeasurements, manufacturedMats, materialCodes, suppliers]) => {
        this.uom = unitOfMeasurements.responseObject;
        this.manufacturedMats = manufacturedMats;
        this.allManufacturedMats = manufacturedMats;
        this.materialCodes = materialCodes.responseObject;
        this.suppliers = suppliers;

        return { unitOfMeasurements, manufacturedMats, materialCodes, suppliers };
      })
    ).subscribe(response => {

      if (this.allManufacturedMats.length > 0) {
        this.manufacturedMat = this.allManufacturedMats[0];

        if (this.manufacturedMat.manufacturedMaterialsInfo.length > 0) {
          this.manufacturedMatsInfo = this.manufacturedMat.manufacturedMaterialsInfo;

          this.getMaterialList();
        }


        this.getHistoryLog(this.manufacturedMat.manufacturedMaterialsId);
      }

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  get totalFindings() {
    if (this.manufacturedMats !== undefined) {
      return this.manufacturedMats.length;
    }
    return 0;
  }

  searchString = '';

  searchTimeout() {
    this.manufacturedMats = this.allManufacturedMats.filter(
      p => p.name.toLowerCase().includes(this.searchString.toLowerCase())
        || p.sku.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  sortColumn = [
    { column: 'manufacturedMaterialsId', sort: '' },
    { column: 'name', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'suppliersId', sort: '' }
  ];

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.manufacturedMats.sort((a, b) => {
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
      this.manufacturedMats.sort((a, b) => {
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

  applyColorBand(manufacturedMat: ManufacturedMaterials) {
    let index = this.allManufacturedMats.indexOf(manufacturedMat);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  getManufacturedMat(manufacturedMat: ManufacturedMaterials) {

    this.manufacturedMat = manufacturedMat;

    this.manufacturedMatsInfo = [];

    if (this.manufacturedMat.manufacturedMaterialsInfo.length > 0) {
      this.manufacturedMatsInfo = this.manufacturedMat.manufacturedMaterialsInfo;
    }

    this.getMaterialList();

    this.getHistoryLog(manufacturedMat.manufacturedMaterialsId);
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

    this.manufacturedMatsService.delete(this.manufacturedMat.manufacturedMaterialsId, '').subscribe(
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
      this.manufacturedMat.manufacturedMaterialsInfo = [];
      this.manufacturedMat.manufacturedMaterialsInfo = this.manufacturedMatsInfo;

      if(this.editMode){
        if(this.fileId !== ''){
          this.manufacturedMatsService.moveTemp(this.manufacturedMat.manufacturedMaterialsId, this.fileId).subscribe(upload => {
            this.manufacturedMat.picPath = upload.responseObject;
            this.manufacturedMatsService.post(this.manufacturedMat, '').subscribe(
              res => {
                this.manufacturedMat = res;
        
                // Need to recall, freaking array doesn't work
                this.manufacturedMatsService.getList().subscribe(res => {
                  this.manufacturedMats = res;
                  this.allManufacturedMats = res;
                });
        
                this.alertService.success('product details updated.');
                this.newMode = false;
                this.editMode = false;
              },
              err => {
                console.log("save ERROR", err);
                this.newMode = false;
                this.editMode = false;
              });
          });
        }
        else{
          this.manufacturedMatsService.post(this.manufacturedMat, '').subscribe(
            res => {
              this.manufacturedMat = res;
      
              // Need to recall, freaking array doesn't work
              this.manufacturedMatsService.getList().subscribe(res => {
                this.manufacturedMats = res;
                this.allManufacturedMats = res;
              });
      
              this.alertService.success('product details updated.');
              this.newMode = false;
              this.editMode = false;
            },
            err => {
              console.log("save ERROR", err);
              this.newMode = false;
              this.editMode = false;
            });
        }
      }
      else if(this.newMode){
        this.manufacturedMatsService.post(this.manufacturedMat, '').subscribe(
          res => {
            this.manufacturedMat = res;
    
            // Need to recall, freaking array doesn't work
            this.manufacturedMatsService.getList().subscribe(res => {
              this.manufacturedMats = res;
              this.allManufacturedMats = res;
            });
    
            if(this.fileId !== ''){
              this.manufacturedMatsService.moveTemp(res.metalGrainsId, this.fileId).subscribe(upload => {
                this.manufacturedMat.picPath = upload.responseObject;
                this.manufacturedMatsService.post(this.manufacturedMat, '').subscribe(result2 => {
                  this.load();
                  this.newMode = false;
                });
              });
            }

            this.alertService.success('product details updated.');
            this.newMode = false;
            this.editMode = false;
          },
          err => {
            console.log("save ERROR", err);
            this.newMode = false;
            this.editMode = false;
          });
      }
    }
    else{
      this.pagePermissionError();
    }
  }

  newMode: boolean = false;

  newProduct() {
    if(this.isAuthorized){
      this.newMode = true;

      this.newFlag = true;

      this.manufacturedMat = new ManufacturedMaterials();
      this.manufacturedMat.name = 'NEW_ITEM';
      this.manufacturedMat.sku = 'NEW_ITEM';
      this.manufacturedMat.createdBy = '';
      this.manufacturedMat.createdDate = new Date();

      this.manufacturedMatsInfo = [];

      if (this.authService != null) {
        this.manufacturedMat.createdBy = this.authService.currentUserValue.userName;
      }

      this.manufacturedMatsService.post(this.manufacturedMat, '').subscribe(
        res => {
          this.manufacturedMat = res;

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

  @ViewChild('uploadImage') imageUploader: ElementRef;
  fileId: string = '';

  uploadTemp(files){
    if (files.length === 0) {
      return;
    }
    this.loadService.loadContent(true);
    const formData = new FormData();
    for (var i = 0; i < files.length; i++) {
      formData.append("file[]", files[i]);
    }
    this.fileId = Guid.newGuid();
    formData.append("id", this.fileId);

    this.manufacturedMatsService.uploadTempPhoto(formData).subscribe(response => {
      if (response.type === HttpEventType.UploadProgress) {
        console.log('Uploading: ' + Math.round(100 * response.loaded / response.total) + '%');
      }
      else if (response.type === HttpEventType.Response) {
        this.manufacturedMat.picPath = response.body.responseObject[0];
        this.imageUploader.nativeElement.value = null;
        this.loadService.loadContent(false);
      }
    }, error => {
      console.log(error);
      this.imageUploader.nativeElement.value = null;
      this.loadService.loadContent(false);
    });
  }

  getHistoryLog(id: number) {
    this.manufacturedMatsService.lastupdate(id).subscribe(
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

  getSelectedManufacturedMatsInfo() {

    this.selectedManufacturedMatsInfo = new ManufacturedMaterialsInfo();

    if (this.selectedMaterialCode != 0 && this.selectedSize != "") {

      this.selectedManufacturedMatsInfo = this.manufacturedMatsInfo.filter(x => x.materialCodeId == this.selectedMaterialCode
        && x.size == this.selectedSize)[0];

      if (this.selectedManufacturedMatsInfo == undefined) {
        this.selectedManufacturedMatsInfo = new ManufacturedMaterialsInfo();
      }

    }

  }

  getMaterialList() {

    if (this.manufacturedMatsInfo.length > 0) {
      this.MatList = this.manufacturedMatsInfo.map(x => parseInt(x.materialCodeId.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      this.SizeList = this.manufacturedMatsInfo.map(x => x.size)
        .filter((value, index, self) => self.indexOf(value) === index);

      if (this.MatList.length > 0 && this.SizeList.length > 0) {
        this.selectedSize = this.manufacturedMatsInfo[0].size;
        this.selectedMaterialCode = this.manufacturedMatsInfo[0].materialCodeId;

        this.highlightMaterials(this.selectedSize);
        this.highlightSizes(this.selectedMaterialCode);

        this.getSelectedManufacturedMatsInfo();
      }
    }
    else {
      this.selectedSize = "";
      this.selectedMaterialCode = 0;
      this.selectedManufacturedMatsInfo = new ManufacturedMaterialsInfo();
      this.MatList = [];
      this.SizeList = [];
    }

  }

  highlightMaterials(size: string) {

    if (this.selectedMaterialCode !== 0) {

      //  var materials = this.lstMatCodeSize.filter(mat => mat.matID == this.productDetails.matID);
      var materials = this.manufacturedMatsInfo.filter(info => info.materialCodeId == this.selectedMaterialCode);

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

    if (this.manufacturedMatsInfo.length > 0 && this.selectedSize != "") {

      var sizes = this.manufacturedMatsInfo.find(x => x.size === this.selectedSize);

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
    this.newManufacturedMatsInfo = new ManufacturedMaterialsInfo();
    this.newManufacturedMatsInfo.manufacturedMaterialsInfoId = 0;
    this.newManufacturedMatsInfo.manufacturedMaterialsId = this.manufacturedMat.manufacturedMaterialsId;
    this.newManufacturedMatsInfo.size = this.modalSize.toString();
    this.newManufacturedMatsInfo.materialCodeId = this.modalMaterialCode;

    this.newManufacturedMatsInfo.stockQty = 0;
    this.newManufacturedMatsInfo.weight = 0;

    if (this.manufacturedMatsInfo != undefined && this.manufacturedMatsInfo.length > 0 ) {
      let index = this.manufacturedMatsInfo.findIndex(d => d.materialCodeId.toString() == this.modalMaterialCode.toString() && d.size == this.modalSize.toString());

      if (index == -1) {
        this.manufacturedMatsInfo.push(this.newManufacturedMatsInfo);
      }
      else {
        this.alertService.error("Existing Material and size combination exist!");
      }
    }
    else {
      this.manufacturedMatsInfo = [];
      this.manufacturedMatsInfo.push(this.newManufacturedMatsInfo);
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
