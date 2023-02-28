import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { Customers, CustomersAddresses } from 'src/app/models/customer';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { GenericComponent, Guid } from '../generic/generic.component';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent extends GenericComponent implements OnInit {

  customers: Customers[] = [];
  filteredCustomers: Customers[] = [];
  customer: Customers = new Customers();
  customerAddress = new CustomersAddresses;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private customerService: CustomerService) {
      super(authService, loadService, alertService);
    }

  ngOnInit(): void {
    this.load();
    this.setPagePermission('Supplier/Customer');
  }

  load(){
    this.customerService.getList().subscribe(result => {
      this.customers = result;
      this.filteredCustomers = this.customers;
      if(this.filteredCustomers.length != 0){
        this.selectItem(this.filteredCustomers[0]);
      }
    });
  }

  toggleEdit(edit: boolean){
    if(this.isAuthorized){
      this.editMode = edit;
    }
    else{
      this.pagePermissionError();
    }
  }


  
  selectItem(customer: Customers) {
    this.customer = new Customers();

    this.customer.custIdno = customer.custIdno;
    this.customer.customerId = customer.customerId;
    this.customer.companyName = customer.companyName;
    this.customer.contactName = customer.contactName;
    this.customer.emailAddress = customer.emailAddress;
    this.customer.paymentTerms = customer.paymentTerms;
    this.customer.picPath = customer.picPath;

    this.customerAddress = new CustomersAddresses();
    if(customer.customersAddresses.length !== 0){
      this.customerAddress.customersAddressesId = customer.customersAddresses[0].customersAddressesId;
      this.customerAddress.custIdno = customer.customersAddresses[0].custIdno;
      this.customerAddress.defaultAddress = customer.customersAddresses[0].defaultAddress;
      this.customerAddress.address1 = customer.customersAddresses[0].address1;
      this.customerAddress.address2 = customer.customersAddresses[0].address2;
      this.customerAddress.city = customer.customersAddresses[0].city;
      this.customerAddress.region = customer.customersAddresses[0].region;
      this.customerAddress.postalCode = customer.customersAddresses[0].postalCode;
      this.customerAddress.country = customer.customersAddresses[0].country;
      this.customerAddress.phone = customer.customersAddresses[0].phone;
      this.customerAddress.fax = customer.customersAddresses[0].fax;
      this.customerAddress.shippingMethod = customer.customersAddresses[0].shippingMethod;
    }

  }

  new(){
    if (this.isAuthorized) {
      this.customer = new Customers();
      this.customerAddress = new CustomersAddresses();
      this.editMode = true;
    }
    else{
      this.pagePermissionError();
    }
  }

  searchTimeout(){
    this.filteredCustomers = this.customers.filter(
      s => s.customerId.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.companyName.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.contactName.toLowerCase().includes(this.searchString.toLowerCase()) 
      || s.emailAddress.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  save(){
    if (this.isAuthorized) {

      if(this.fileId !== ''){
        this.customerService.moveTemp(this.customer.custIdno, this.fileId).subscribe(upload => {
          this.customer.picPath = upload.responseObject;
          this.customerService.post(this.customer, '').subscribe(result => {
            this.load();
            this.editMode = false;
          });
        });
      }
      else{
        this.customerService.post(this.customer, '').subscribe(result => {
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
    this.customer = new Customers();
    this.customers = [];
    this.filteredCustomers = [];
    this.editMode = false;

    this.load();
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

    this.customerService.uploadTempPhoto(formData).subscribe(response => {
      if (response.type === HttpEventType.UploadProgress) {
        console.log('Uploading: ' + Math.round(100 * response.loaded / response.total) + '%');
      }
      else if (response.type === HttpEventType.Response) {
        this.customer.picPath = response.body.responseObject[0];
        this.imageUploader.nativeElement.value = null;
        this.loadService.loadContent(false);
      }
    }, error => {
      console.log(error);
      this.imageUploader.nativeElement.value = null;
      this.loadService.loadContent(false);
    });
  }

  applyColorBand(customer: Customers) {
    let index = this.filteredCustomers.indexOf(customer);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

}
