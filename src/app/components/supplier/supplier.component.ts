import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { Suppliers } from 'src/app/models/suppliers.model';
import { AuthService } from 'src/app/services/auth.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { GenericComponent, Guid } from '../generic/generic.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private supplierService: SupplierService) {
      super(authService, loadService, alertService);
    }

  ngOnInit(): void {
    this.load();
    this.setPagePermission('Supplier/Customer');
  }

  load(){
    this.supplierService.getList().subscribe(result => {
      this.suppliers = result;
      this.filteredSuppliers = this.suppliers;
      if(this.filteredSuppliers.length != 0){
        this.selectItem(this.filteredSuppliers[0]);
      }
    });
  }

  suppliers: Suppliers[] = [];
  filteredSuppliers: Suppliers[] = [];
  supplier: Suppliers = new Suppliers();

  toggleEdit(edit: boolean){
    if(this.isAuthorized){
      this.editMode = edit;
    }
    else{
      this.pagePermissionError();
    }
  }
  
  selectItem(supplier: Suppliers) {
    this.supplier.supplierId = supplier.supplierId;
    this.supplier.suppliersId = supplier.suppliersId;
    this.supplier.companyName = supplier.companyName;
    this.supplier.contactName = supplier.contactName;
    this.supplier.emailAddress = supplier.emailAddress;
    this.supplier.address1 = supplier.address1;
    this.supplier.address2 = supplier.address2;
    this.supplier.city = supplier.city;
    this.supplier.region = supplier.region;
    this.supplier.postalCode = supplier.postalCode;
    this.supplier.country = supplier.country;
    this.supplier.phone = supplier.phone;
    this.supplier.fax = supplier.fax;
    this.supplier.shippingMethod = supplier.shippingMethod;
    this.supplier.leadtimeDays = supplier.leadtimeDays;
    this.supplier.paymentTerms = supplier.paymentTerms;
    this.supplier.picPath = supplier.picPath;
  }

  // editMode: boolean = false;

  new(){
    if(this.isAuthorized){
      this.supplier = new Suppliers();
      this.editMode = true;
    }
    else{
      this.pagePermissionError();
    }
  }

  // searchString = '';

  searchTimeout(){
    this.filteredSuppliers = this.suppliers.filter(
      s => s.supplierId.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.companyName.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.contactName.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.emailAddress.toLowerCase().includes(this.searchString.toLowerCase())
      || s.shippingMethod.toLowerCase().includes(this.searchString.toLowerCase())
      || s.leadtimeDays.toString().toLowerCase().includes(this.searchString.toLowerCase())
      || s.paymentTerms.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  save(){
    if(this.isAuthorized){

      if(this.fileId !== ''){
        this.supplierService.moveTemp(this.supplier.suppliersId, this.fileId).subscribe(upload => {
          this.supplier.picPath = upload.responseObject;
          this.supplierService.post(this.supplier, '').subscribe(result => {
            this.load();
            this.editMode = false;
          });
        });
      }
      else{
        this.supplierService.post(this.supplier, '').subscribe(result => {
          this.load();
          this.editMode = false;
        });
      }
    }
    else{
      this.pagePermissionError();
    }
  }

  cancelChanges(){
    this.supplier = new Suppliers();
    this.suppliers = [];
    this.filteredSuppliers = [];
    this.editMode = false;
    // this.load();
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

    this.supplierService.uploadTempPhoto(formData).subscribe(response => {
      if (response.type === HttpEventType.UploadProgress) {
        console.log('Uploading: ' + Math.round(100 * response.loaded / response.total) + '%');
      }
      else if (response.type === HttpEventType.Response) {
        this.supplier.picPath = response.body.responseObject[0];
        this.imageUploader.nativeElement.value = null;
        this.loadService.loadContent(false);
      }
    }, error => {
      console.log(error);
      this.imageUploader.nativeElement.value = null;
      this.loadService.loadContent(false);
    });
  }

  applyColorBand(supplier: Suppliers) {
    let index = this.filteredSuppliers.indexOf(supplier);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

}
