import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { MaterialCode } from 'src/app/models/material-code';
import { OrdersDetails } from 'src/app/models/orders.model';
import { Product } from 'src/app/models/product';
import { AuthService } from 'src/app/services/auth.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { OrderdetailsService } from 'src/app/services/orderdetails.service';
import { ProductService } from 'src/app/services/product.service';
import { GenericComponent } from '../../generic/generic.component';

@Component({
  selector: 'app-new-orderdetails-item',
  templateUrl: './new-orderdetails-item.component.html',
  styleUrls: ['./new-orderdetails-item.component.scss']
})
export class NewOrderdetailsItemComponent extends GenericComponent implements OnInit {
  @Input() orderDetails: OrdersDetails = new OrdersDetails();

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private orderDetailsService: OrderdetailsService
    , private productService: ProductService
    , private materialCodeService: MaterialCodeService
  ) {
    super(authService, loadService, alertService);
  }

  products: Product[] = [];
  materialCodes: MaterialCode[] = [];
  materialSizes: string[] = [];
  
  product: Product = new Product();
  materialCode: MaterialCode = new MaterialCode();
  materialSize: string = '';

  productControl = new FormControl();
  materialCodeControl = new FormControl();
  materialSizeControl = new FormControl();

  filteredProducts: Observable<Product[]>;
  filteredMaterialCodes: Observable<MaterialCode[]>;
  filteredMaterialSizes: Observable<string[]>;

  displayFn(item: Product): string {
    return item && item.productName ? item.productName : '';
  }

  displayMatCode(item: MaterialCode): string {
    return item && item.code ? item.code : '';
  }

  displayMatSize(item: string): string {
    return item ? item : '';
  }

  private _filterProduct(name: string): Product[] {
    if(name !== undefined && typeof(name) === 'string'){
      const filterValue = name.toLowerCase();
      return this.products.filter(option => option.productName.toLowerCase().includes(filterValue));
    }
    else if(typeof(name) === 'object'){
      const filterValue: string = name['productName'];
      return this.products.filter(option => option.productName.toLowerCase().includes(filterValue.toLowerCase()));
    }
    return this.products;
  }

  private _filterMatCode(name: string): MaterialCode[] {
    if(name !== undefined && typeof(name) === 'string'){
      const filterValue = name.toLowerCase();
      return this.materialCodes.filter(item => item.code.toLowerCase().includes(filterValue));
    }
    else if(typeof(name) === 'object'){
      const filterValue: string = name['code'];
      return this.materialCodes.filter(item => item.code.toLowerCase().includes(filterValue.toLowerCase()));
    }
    return this.materialCodes;
  }

  private _filterMatSize(name: string): string[] {
    if(name !== undefined && typeof(name) === 'string'){
      const filterValue = name.toLowerCase();
      return this.materialSizes.filter(item => item.toLowerCase().includes(filterValue));
    }
    else if(typeof(name) === 'object'){
      const filterValue: string = name;
      return this.materialSizes.filter(item => item.toLowerCase().includes(filterValue.toLowerCase()));
    }
    return this.materialSizes;
  }

  ngOnInit(): void {
    forkJoin([
      this.productService.getList(),
      this.materialCodeService.getList(),
    ]).pipe(
      map(([products, materialCodes]) => {
        this.products = products;
        this.materialCodes = materialCodes.responseObject;
      })
    ).subscribe(response => {
      if(this.orderDetails.ordersDetailsId !== 0){
        // this.product = this.products.find(x => x.productsId == this.orderDetails.productsId);
        // this.materialCode = this.materialCodes.find(x => x.materialCodeId == this.orderDetails.productsInfo.materialCodeId);
        // let productInfos = this.product.productsInfo.filter(x => x.materialCodeId == this.materialCode.materialCodeId);
        // productInfos.forEach(x => {
        //   this.materialSizes.push(x.size);
        // });
        // this.materialSize = this.orderDetails.productsInfo.size;
      }
      this.initiateFilters();
    });
  }

  disableMaterialCodes: boolean = true;
  disableMaterialSizes: boolean = true;

  initiateFilters(){
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(this.product.productName),
      map(value => this._filterProduct(value))
    );
    this.filteredMaterialCodes = this.materialCodeControl.valueChanges.pipe(
      startWith(this.materialCode.code),
      map(value => this._filterMatCode(value))
    );
    this.materialCodeControl.valueChanges.subscribe(value => {
      this.materialSizes = [];
      let productInfos = this.product.productsInfo.filter(x => x.materialCodeId == value.materialCodeId);
      productInfos.forEach(x => {
        this.materialSizes.push(x.size);
      });
    });
    this.filteredMaterialSizes = this.materialSizeControl.valueChanges.pipe(
      startWith(this.materialSize),
      map(value => this._filterMatSize(value))
    );
  }

  matCodeDisable: boolean = true;
  matSizeDisable: boolean = true;

  productChange(event){
    let matCodesHolder = this.materialCodes;
    this.materialCodes = [];
    this.orderDetails.productsId = this.product.productsId;
    this.product.productsInfo.forEach(x => {
      let item = matCodesHolder.find(y => y.materialCodeId == x.materialCodeId);
      this.materialCodes.push(item);
    });
    this.matCodeDisable = false;
  }

  matCodeChange(event){
    let productInfos = this.product.productsInfo.filter(x => x.materialCodeId == this.materialCode.materialCodeId);
    productInfos.forEach(x => {
      this.materialSizes.push(x.size);
    });
    this.matSizeDisable = false;
  }

  matSizeChange(event){
    this.orderDetails.productsInfoId = this.product.productsInfo
    .find(x => x.materialCodeId == this.materialCode.materialCodeId && x.size == this.materialSize).productsInfoId;
    this.disableSaveButton = false;
  }
  
  disableSaveButton: boolean = true;

  save(){
    this.loadService.loadContent(true);
    this.orderDetailsService.addupdate(this.orderDetails).subscribe(result => {
      console.log(result);
      this.loadService.loadContent(false);
    });
  }

}
