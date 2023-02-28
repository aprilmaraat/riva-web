import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { MaterialCode } from 'src/app/models/material-code';
import { MetalGrain } from 'src/app/models/metal-grain';
import { Suppliers } from 'src/app/models/suppliers.model';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { AuthService } from 'src/app/services/auth.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { MetalGrainService } from 'src/app/services/metal-grain.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { GenericComponent, Guid } from '../generic/generic.component';

@Component({
  selector: 'app-metal-grain',
  templateUrl: './metal-grain.component.html',
  styleUrls: ['./metal-grain.component.scss']
})
export class MetalGrainComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private metalGrainService: MetalGrainService
    , private supplierService: SupplierService
    , private materialCodeService: MaterialCodeService
    , private uomService: UnitOfMeasureService) {
      super(authService, loadService, alertService);
      this.load();
    }

  ngOnInit(): void {
    this.setPagePermission('Metal Grains');
  }

  metalGrains: MetalGrain[] = [];
  materialCodes: MaterialCode[] = [];
  suppliers: Suppliers[] = [];
  unitOfMeasures: UnitOfMeasure[] = [];

  getMaterial(materialCodeId: number){
    let x = this.materialCodes.find(x => x.materialCodeId == materialCodeId);
    if(x !== undefined){
      return x.code;
    }
    return '';
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

  getUom(uomId: number){
    let x = this.unitOfMeasures.find(x => x.unitsOfMeasureId == uomId);
    if(x !== undefined){
      return x.uom;
    }
    return '';
  }

  load(){
    forkJoin(
      [
        this.metalGrainService.getList(),
        this.materialCodeService.getList(),
        this.supplierService.getList(),
        this.uomService.getList()
      ]
    ).pipe(
      map(([metalGrainList, materialCodesList, supplierList, uomList]) => {
        let metalGrainsResult = metalGrainList;
        let materialCodesResult = materialCodesList;
        let suppliersResult = supplierList;
        let uomResult = uomList;
        return { metalGrainsResult, materialCodesResult, suppliersResult, uomResult };
      })
    ).subscribe(data => {
      this.metalGrains = data.metalGrainsResult;
      this.filteredMetalGrains = this.metalGrains;
      if(this.filteredMetalGrains.length != 0){
        this.selectItem(this.filteredMetalGrains[0]);
      }
      this.materialCodes = data.materialCodesResult.responseObject;
      this.suppliers = data.suppliersResult;
      this.unitOfMeasures = data.uomResult.responseObject;
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
    });

  }

  searchString = '';
  filteredMetalGrains: MetalGrain[] = [];

  searchTimeout(){
    this.filteredMetalGrains = this.metalGrains.filter(
      x => x.name.toLowerCase().includes(this.searchString.toLowerCase()) 
      || x.sku.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  metalGrain: MetalGrain = new MetalGrain();

  selectItem(metalGrain: MetalGrain) {
    if(!this.editMode && !this.newMode){
      this.metalGrain.metalGrainsId = metalGrain.metalGrainsId;
      this.metalGrain.name = metalGrain.name;
      this.metalGrain.sku = metalGrain.sku;
      this.metalGrain.suppliersId = metalGrain.suppliersId;
      this.metalGrain.supplierSku = metalGrain.supplierSku;
      this.metalGrain.commentBox = metalGrain.commentBox;
      this.metalGrain.picPath = metalGrain.picPath;
      this.metalGrain.materialCode = metalGrain.materialCode;
      this.metalGrain.uom = metalGrain.uom;
      this.metalGrain.qtyinStock = metalGrain.qtyinStock;
      this.metalGrain.qtyinScrap = metalGrain.qtyinScrap;
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
      if (this.editMode) {
        if(this.fileId !== ''){
          this.metalGrainService.moveTemp(this.metalGrain.metalGrainsId, this.fileId).subscribe(upload => {
            this.metalGrain.picPath = upload.responseObject;
            this.metalGrainService.post(this.metalGrain, '').subscribe(result => {
              console.log(result);
              this.load();
              this.editMode = false;
            });
          });
        }
        else{
          this.metalGrainService.post(this.metalGrain, '').subscribe(result => {
            console.log(result);
            this.load();
            this.editMode = false;
          });
        }
      }
      else if (this.newMode) {

        this.metalGrainService.post(this.metalGrain, '').subscribe(result1 => {
          this.metalGrain = result1;
          this.load();
          this.newMode = false;

          if(this.fileId !== ''){
            this.metalGrainService.moveTemp(result1.metalGrainsId, this.fileId).subscribe(upload => {
              this.metalGrain.picPath = upload.responseObject;
              this.metalGrainService.post(this.metalGrain, '').subscribe(result2 => {
                //this.load();
                //this.newMode = false;
                console.log('Re-post metal grains')
              });
            });
          }
        });

      }
    }
    else{
      this.pagePermissionError();
    }
  }

  cancelChanges(){
    this.metalGrain = new MetalGrain();
    this.metalGrains = [];
    this.filteredMetalGrains = [];
    this.editMode = false;
    this.newMode = false;
    this.load();
  }

  newMode: boolean = false;

  new(){
    if(this.isAuthorized){
      this.metalGrain = new MetalGrain();
      this.newMode = true;
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

    this.metalGrainService.uploadTempPhoto(formData).subscribe(response => {
      if (response.type === HttpEventType.UploadProgress) {
        console.log('Uploading: ' + Math.round(100 * response.loaded / response.total) + '%');
      }
      else if (response.type === HttpEventType.Response) {
        this.metalGrain.picPath = response.body.responseObject[0];
        this.imageUploader.nativeElement.value = null;
        this.loadService.loadContent(false);
      }
    }, error => {
      console.log(error);
      this.imageUploader.nativeElement.value = null;
      this.loadService.loadContent(false);
    });
  }

  applyColorBand(metalGrain: MetalGrain) {
    let index = this.metalGrains.indexOf(metalGrain);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

}
