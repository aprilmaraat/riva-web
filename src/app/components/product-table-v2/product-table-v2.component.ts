import { Component, OnInit, HostListener, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { ProductService } from 'src/app/services/product.service';
import { Customers } from 'src/app/models/customer';
import { ProductStatus, ProductDetailResponse, Product, ProductsStoreInfo, ProductsInfo } from 'src/app/models/product';
import { JewelryType } from 'src/app/models/jewelry-type';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { CustomerService } from 'src/app/services/customer.service';
import { JewelryTypeService } from 'src/app/services/jewelry-type.service';
import { ProductBomService } from 'src/app/services/product-bom.service';
import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { ProductSearch } from 'src/app/models/request/product-search-request';
import { cloneDeep } from 'lodash';

export const ProductTypeMapping = [
  { value: 0, text: 'All'},
  { value: 1, text: 'Products' },
  { value: 2, text: 'Subassembly' }
];

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40
};

@Component({
  selector: 'app-product-table-v2',
  templateUrl: './product-table-v2.component.html',
  styleUrls: ['./product-table-v2.component.scss']
})
export class ProductTableV2Component extends GenericComponent implements OnInit {
  tableCollapsed = false;
  editMode = false;

  productTypes: { value: number; text: string; }[];

  customers: Customers[];

  getCustomerName(custIdNo: number){
    let customer = this.customers.find(x => x.custIdno == custIdNo);
    if(customer != undefined){
      return customer.customerId;
    }
    return '-ERROR-';
  }

  statuses: ProductStatus[];
  jewelryTypes: JewelryType[];
  materialCodes: MaterialCode[];
  uom: UnitOfMeasure[];

  products: Product[];
  product: Product = new Product;

  productDetailList: ProductDetailResponse[];

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private productService: ProductService, private customerService: CustomerService,
    private materialCodeService: MaterialCodeService, private uomService: UnitOfMeasureService,
    private jewelryTypeService: JewelryTypeService, private bomService: ProductBomService){
    super(authService, loadService, alertService);
    this.productTypes = ProductTypeMapping;
    this.loadService.loadContent(true);
    this.load();
  }

  tableActive = false;
  // Hotfix for up/down keypress product list navigation
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.tableActive) {
      let currentIndex = this.products.indexOf(this.product);
      if (currentIndex < this.products.length - 1 && currentIndex >= 0) {
        if (event.keyCode == KEY_CODE.UP_ARROW && currentIndex !== 0) {
          currentIndex -= 1;
          this.product = this.products[currentIndex];
        }
        else if (event.keyCode == KEY_CODE.DOWN_ARROW && currentIndex < this.products.length) {
          currentIndex += 1;
          this.product = this.products[currentIndex];
        }
        this.getProductLocal(this.product);
      }

    }
  }

  ngOnInit(): void {
    this.loadService.loadContent(false);
  }

  load(){
    forkJoin(
      [this.customerService.getList(),
      this.materialCodeService.getList(),
      this.productService.getProductStatuses(),
      this.uomService.getList(),
      this.jewelryTypeService.getList()]
    ).pipe(
      map(([customers, materialCodes, productStatuses, unitOfMeasurements, jewelryTypes]) => {
        this.customers = customers;
        this.materialCodes = materialCodes.responseObject;
        this.statuses = productStatuses.responseObject;
        this.uom = unitOfMeasurements.responseObject;
        this.jewelryTypes = jewelryTypes.responseObject;

        return { customers, materialCodes, productStatuses, unitOfMeasurements };
      })
    ).subscribe(response => {
      this.getProductSearch();
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  get totalProducts() {
    if (this.products !== undefined) {
      return this.products.length;
    }
    return 0;
  }

  searchString = '';
  selectedProductType = 1; // default to products
  selectedCustomer = 0;
  selectedJewelryType = 0;

  selectedUOM = 1;
  selectedCode: number = 5;
  selectedMaterialCode: number = 0;

  allProducts: Product[] = [];

  searchTimeout(){
    this.products = this.allProducts.filter(
      p => p.sku.toLowerCase().includes(this.searchString.toLowerCase()) 
      || p.customerSku.toLowerCase().includes(this.searchString.toLowerCase()) 
      || p.productName.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  searchPanelChange() {
    this.alertService.clear();
    this.getProductSearch();
  }

  indexMax = 0;
  index = 0;

  getProductSearch(selectedProduct?: number) {
    let searchObject = new ProductSearch;
    this.sortColumn.forEach(s => { s.sort = ''; });

    this.loadService.loadContent(true);
    this.product.customerCode = 5;
    if (this.selectedCustomer != 0) {
      this.product.customerCode = this.customers.find(c => c.custIdno == this.selectedCustomer).custIdno;
    }

    searchObject.searchString = this.searchString;
    searchObject.customerCode = this.product.customerCode;
    searchObject.jewelryType = this.selectedJewelryType;
    searchObject.productTypeID = this.selectedProductType;

    this.index = 0;
    this.indexMax = 0;

    this.productService.getSearchList(searchObject).subscribe(response => {
      this.products = response;
      this.allProducts = response;

      this.products.forEach(item => {
        item = this.mapTypeNames(item);
        item.inStore = this.inStore(item.productsId);
      });

      this.products.sort((a, b) => {
        if (a.productsId > b.productsId) {
          return 1;
        }

        if (a.productsId < b.productsId) {
          return -1;
        }

        return 0;
      });

      if (this.products.length !== 0) {
        this.indexMax = this.products.length - 1;

        this.product = this.products.find(p => p.productsId === selectedProduct);
        
        if (selectedProduct == undefined) {
          this.product = this.products[this.index];
        }
        this.productOutput.emit(this.product);
        this.setProductsStoreInfo();
      }
      else {
        this.product = new Product();
        this.alertService.error('No records found.');
        this.loadService.loadContent(false);
      }

      if (this.product.picPath === null) {
        this.product.picPath = '../../../assets/images/no-image.png';
      }

      if (this.product.productsInfo.length > 0) {
        this.productsInfo = [];
        this.productsInfo = cloneDeep(this.product.productsInfo);
      }

      this.selectedCode = this.customers.find(c => c.custIdno == this.product.customerCode).custIdno;
      this.loadService.loadContent(false);
    }, error => {
      this.product = new Product();
      this.loadService.loadContent(false);
      this.alertService.error('Internal error.');
    });

  }

  mapTypeNames(product: Product) {
    product.productTypeName = this.productTypes.find(pt => pt.value === product.productsTypeId).text;
    product.jewelryTypeName = this.jewelryTypes.find(jt => jt.jewelryTypeId === product.jewelryType).type;
    return product;
  }

  viewSubassembly(subProductsId: number) {
    this.productService.viewSubassembly(subProductsId).subscribe(result => {
      this.products = result.responseObject;
      let product = this.products.find(p => p.productsId === subProductsId);
      this.selectedProductType = product.productsTypeId;
      this.getProductLocal(product);
    });
  }

  sortColumn = [
    { column: 'productsId', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'customerSku', sort: '' },
    { column: 'productTypeName', sort: '' },
    { column: 'productName', sort: '' },
    { column: 'customerCode', sort: '' },
    { column: 'jewelryTypeName', sort: '' },
    { column: 'inStore', sort: '' }
  ];

  onSort(column: string) {
    if (this.checkStringIfEmpty(this.sortColumn.find(s => s.column === column).sort) || this.sortColumn.find(s => s.column === column).sort !== 'asc') {
      this.sortColumn.forEach(s => { s.sort = ''; });
      this.sortColumn.find(s => s.column === column).sort = 'asc';
      this.products.sort((a, b) => {
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
      this.products.sort((a, b) => {
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

  applyColorBand(product: Product) {
    let index = this.products.indexOf(product);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  productsStoreInfo = new ProductsStoreInfo();
  productsInfo: ProductsInfo[];
  @Output() productStoreInfoOutput = new EventEmitter<ProductsStoreInfo>();
  @Output() productOutput = new EventEmitter<Product>();
  @Input() showCollapseButton: boolean = true;

  private _updatedProduct: Product = undefined;
  @Input() set updatedProduct(data: Product) {
    this._updatedProduct = data;
    this.updateProductValue(this._updatedProduct);
  }
  get updatedProduct(): Product {
    return this._updatedProduct;
  }

  updateProductValue(product: Product){
    if(product !== undefined){
      
      let item = this.products.find(p => p.productsId == product.productsId);
      product = this.mapTypeNames(product);
      product.inStore = product.productsStoreInfo[0].storeFlag;
      this.products[this.products.indexOf(item)] = product;
      
    }
  }

  getProductLocal(product: Product) {
    this.product = product;
    this.productOutput.emit(this.product);

    this.setProductsStoreInfo();

    if (this.product.productsInfo.length > 0) {
      this.productsInfo = [];
      this.productsInfo = cloneDeep(this.product.productsInfo);
    }

    if (this.product.picPath === null) {
      this.product.picPath = '../../../assets/images/no-image.png';
    }
  }

  setProductsStoreInfo(){
    this.productsStoreInfo = new ProductsStoreInfo();

    this.productsStoreInfo.productsId = this.product.productsId;

    if (this.product.productsStoreInfo !== undefined) {
      if (this.product.productsStoreInfo[0] !== undefined) {
        this.productsStoreInfo = this.product.productsStoreInfo[0];
        this.productStoreInfoOutput.emit(this.productsStoreInfo);
      }
    }
  }

  inStore(productId: number){
    let storeInfo = this.products.find(p => p.productsId === productId).productsStoreInfo[0];
    if(storeInfo != undefined){
      return storeInfo.storeFlag;
    }
    else{
      return false;
    }
  }

}
