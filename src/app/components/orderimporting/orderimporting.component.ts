import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { HttpEventType } from '@angular/common/http';
import { LoadService } from '../../custom/load-overlay/load-overlay.service';
import { Customer } from 'src/app/models/enum/customer.enum';
import { OrderImportResponse } from 'src/app/models/rgw-order-import.response';
import { AlertService } from 'src/app/custom/_alert';

export const CustomerMapping = [
  { value: Customer.HOF, type: 'HOF' },
  { value: Customer.HOFFullfilment, type: 'HOF Fulfillment' },
  { value: Customer.Ringware, type: 'Ringware' },
  { value: Customer.Mizuki, type: 'Mizuki' },
  { value: Customer.BaubleBar, type: 'BaubleBar' }
];

@Component({
  templateUrl: './orderimporting.component.html',
  styleUrls: ['./orderimporting.component.scss']
})
export class OrderImportingComponent extends GenericComponent implements OnInit {
  orderImportResponse: OrderImportResponse = new OrderImportResponse;
  customers: { value: Customer; type: string; }[];
  selectedCustomer: number = 0;
  invalidOrderItemsCount: number = 0;
  succeededOrderItemsCount: number = 0;
  orderExists: boolean = false;

  dateTimeFilter = new Date();
  hofDueDate: Date;

  @ViewChild('excelUploader') excelUploaderFiles: ElementRef;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private orderService: OrderService) {
    super(authService, loadService, alertService);
    this.checkCache();
    this.loadService.load(false);
    this.loadService.loadContent(false);
    this.customers = CustomerMapping;
  }

  ngOnInit(): void {
    
  }

  public uploadFile(files){
    this.loadService.loadContent(true);
    this.orderImport(files);
  }

  public orderImport = (files) => {
    if (files.length === 0)
      return;

    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    switch(this.selectedCustomer) {
      case 1: { 
        this.orderService.upload(formData, null, 'hof').subscribe(event => {
          if (event.type === HttpEventType.UploadProgress)
            console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
          else if (event.type === HttpEventType.Response) {
            this.orderImportResponse = event.body;
            this.invalidOrderItemsCount = this.orderImportResponse.invalidOrders.length;
            this.succeededOrderItemsCount = this.orderImportResponse.succeedOrders;
            this.orderExists = this.orderImportResponse.orderExists;
            if(this.invalidOrderItemsCount > 0)
              this.alertService.error('There are invalid orders.');
            if(this.orderExists)
              this.alertService.error('Order already exist.');
            if(this.invalidOrderItemsCount === 0 && !this.orderExists)
              this.alertService.success('Import success.');
            this.excelUploaderFiles.nativeElement.value = null;
            this.loadService.loadContent(false);
          }
        }, error => {
          this.alertService.error(error.error);
          this.excelUploaderFiles.nativeElement.value = null;
          this.loadService.loadContent(false);
        }); 
        break; 
      } 
      case 2: { 
        this.orderService.upload(formData, this.hofDueDate,'hoffulfill').subscribe(event => {
          if (event.type === HttpEventType.UploadProgress)
            console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
          else if (event.type === HttpEventType.Response) {
            this.orderImportResponse = event.body;
            this.invalidOrderItemsCount = this.orderImportResponse.invalidOrders.length;
            this.succeededOrderItemsCount = this.orderImportResponse.succeedOrders;
            this.orderExists = this.orderImportResponse.orderExists;
            if(this.invalidOrderItemsCount > 0)
              this.alertService.error('There are invalid orders.');
            if(this.orderExists)
              this.alertService.error('Order already exist.');
            if(this.invalidOrderItemsCount === 0 && !this.orderExists)
              this.alertService.success('Import success.');
            this.excelUploaderFiles.nativeElement.value = null;
            this.loadService.loadContent(false);
          }
        }, error => {
          this.alertService.error(error.error);
          this.excelUploaderFiles.nativeElement.value = null;
          this.loadService.loadContent(false);
        }); 
        break; 
      }
      case 3: { 
        this.orderService.upload(formData, null, 'rgw').subscribe(event => {
          if (event.type === HttpEventType.UploadProgress)
            console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
          else if (event.type === HttpEventType.Response) {
            this.orderImportResponse = event.body;
            this.invalidOrderItemsCount = this.orderImportResponse.invalidOrders.length;
            this.succeededOrderItemsCount = this.orderImportResponse.succeedOrders;
            this.orderExists = this.orderImportResponse.orderExists;
            if(this.invalidOrderItemsCount > 0)
              this.alertService.error('There are invalid order items.');
            if(this.orderExists)
              this.alertService.error('Order already exist.');
            if(this.invalidOrderItemsCount === 0 && !this.orderExists)
              this.alertService.success('Import success.');
            this.excelUploaderFiles.nativeElement.value = null;
            this.loadService.loadContent(false);
          }
        }, error => {
          this.alertService.error(error.error);
          this.excelUploaderFiles.nativeElement.value = null;
          this.loadService.loadContent(false);
        }); 
        break; 
      }
      case 4: {
        this.loadService.loadContent(false);
        this.alertService.error('Mizuki order import not implemented');
        this.excelUploaderFiles.nativeElement.value = null;
        break; 
      }
      case 5: { 
        this.loadService.loadContent(false);
        this.alertService.error('BaubleBar order import not implemented');
        this.excelUploaderFiles.nativeElement.value = null;
        break; 
      } 
      default: { 
        this.loadService.loadContent(false);
        this.alertService.error('Value not in list.');
        break; 
      } 
    }

  }
}
