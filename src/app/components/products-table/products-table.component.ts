import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { CustomerCode } from 'src/app/models/enum/customer.enum';
import { ProductService } from 'src/app/services/product.service';
import { Product, ProductStatus, ProductsStoreInfo, ProductsInfo, ProductsRouting, RoutingCodes } from 'src/app/models/product';
import { CustomerService } from 'src/app/services/customer.service';
import { Customers } from 'src/app/models/customer';
import { MaterialCode, Sizes, MatCodeSize, SizeUpdate } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { ProductDetails } from 'src/app/models/product-stock';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { ProductSearch } from 'src/app/models/request/product-search-request';
import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { JewelryTypeService } from 'src/app/services/jewelry-type.service';
import { JewelryType } from 'src/app/models/jewelry-type';
import { HttpEventType } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ProductBomService } from 'src/app/services/product-bom.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Historylogs } from '../../models/historylogs.model';
import { ProductsRoutingService } from '../../services/products-routing.service';
import { FormBuilder, FormArray, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MetalGrainService } from 'src/app/services/metal-grain.service';
import { MetalGrain } from 'src/app/models/metal-grain';

export const ProductTypeMapping = [
  //{ value: 0, text: 'All' },
  { value: 1, text: 'Products' },
  { value: 2, text: 'Subassemblies' }
];

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40
};

@Component({
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss'],
})
export class ProductsTableComponent extends GenericComponent implements OnInit {

  customers: Customers[];
  statuses: ProductStatus[];
  jewelryTypes: JewelryType[];
  materialCodes: MaterialCode[];
  routingCodes: RoutingCodes[];

  tableCollapsed = false;

  uom: UnitOfMeasure[];
  error = {
    sku: false,
    name: false
  };

  products: Product[];
  product: Product = new Product;

  productTypes: { value: number; text: string; }[];
  // editMode = false;
  newMode = false;
  indexMax = 0;
  index = 0;
  updateFlag = false;

  customerCodes = CustomerCode;

  searchString = '';
  selectedProductType = 1; // default to products
  selectedCustomer = 0;
  selectedJewelryType = 0;

  selectedUOM = 1;
  selectedCode: number = 1;
  highlightSize: boolean = false;
  highlightMats: boolean = false;



  sorted: Product[];
  sortColumn = [
    { column: 'productsId', sort: '' },
    { column: 'sku', sort: '' },
    { column: 'customerSku', sort: '' },
    { column: 'productTypeName', sort: '' },
    { column: 'productName', sort: '' },
    { column: 'customerCode', sort: '' },
    { column: 'jewelryTypeName', sort: '' }
  ];

  showEditModeSizes = false;

  lastUpdated = new Historylogs();

  productsStoreInfo = new ProductsStoreInfo();
  productsInfo: ProductsInfo[] = [];
  prodMatList: number[];
  prodSizeList: string[];

  selectedProductsInfo = new ProductsInfo();
  newProductsInfo = new ProductsInfo();
  selectedMaterialCode: number = -1;
  selectedSize = '';
  modalMaterialCode = 0;
  modalSize = '';

  productsRouting: ProductsRouting[] = [];
  notification = null;
  routingForms: FormArray = this.fb.array([]);

  @ViewChild('uploadImage') imageUploader: ElementRef;

  constructor(
    authService: AuthService, 
    loadService: LoadService, 
    alertService: AlertService,
    private productService: ProductService, 
    private customerService: CustomerService,
    private materialCodeService: MaterialCodeService, 
    private uomService: UnitOfMeasureService,
    private jewelryTypeService: JewelryTypeService, 
    private bomService: ProductBomService,
    private productsRoutingService: ProductsRoutingService,
    private metalGrainService: MetalGrainService,
    private modalService: NgbModal,
    private _sanitizer: DomSanitizer,
    private _date: DatePipe,
    private fb: FormBuilder) {
    super(authService, loadService, alertService);
    this.productTypes = ProductTypeMapping;
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

  get totalProducts() {
    if (this.products !== undefined) {
      return this.products.length;
    }
    return 0;
  }

  ngOnInit(): void {
    this.load();
    this.setPagePermission('Products');
  }

  filteredMetalGrain: Observable<MetalGrain[]>;
  // metalGrains: MetalGrain[] = [];
  metalGrainControl = new FormControl();
  selectedMetalGrain: MetalGrain = new MetalGrain();
  _metalGrains: MetalGrain[] = [];
  metalGrainsDropdown: MetalGrain[] = [];

  load() {
    forkJoin([
      this.customerService.getList(),
      this.materialCodeService.getList(),
      this.productService.getProductStatuses(),
      this.uomService.getList(),
      this.jewelryTypeService.getList(),
      this.productsRoutingService.getListCodes(),
      this.metalGrainService.getList()]
    ).pipe(
      map(([customers, materialCodes, productStatuses, unitOfMeasurements, jewelryTypes, routingCodes, metalGrains]) => {
        this.customers = customers;
        this.materialCodes = materialCodes.responseObject;
        this.statuses = productStatuses.responseObject;
        this.uom = unitOfMeasurements.responseObject;
        this.jewelryTypes = jewelryTypes.responseObject;
        this.routingCodes = routingCodes;
        this._metalGrains = metalGrains;
        return { customers, materialCodes, productStatuses, unitOfMeasurements, routingCodes};
      })
    ).subscribe(response => {
      this.getProductSearch();
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  closeResult = '';

  editMaterial: MaterialCode;

  modalOpen(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      // Add New Info
      this.AddNewProductInfo();

    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  transform(value: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

  AddNewProductInfo() {
    this.newProductsInfo = new ProductsInfo();
    this.newProductsInfo.productsInfoId = 0;
    this.newProductsInfo.productsId = this.product.productsId;
    this.newProductsInfo.size = this.modalSize.toString();
    this.newProductsInfo.materialCodeId = this.modalMaterialCode;
    this.newProductsInfo.priceRetail = 0;
    this.newProductsInfo.priceWhls = 0;
    this.newProductsInfo.stockQty = 0;
    this.newProductsInfo.weight = 0;
    this.newProductsInfo.metalGrainsId = 0;

    let index = this.productsInfo.findIndex(d => d.materialCodeId.toString() == this.modalMaterialCode.toString() && d.size == this.modalSize.toString());

    if (index == -1) {
      this.productsInfo.push(this.newProductsInfo);
    }
    else {
      this.alertService.error("Existing Material and size combination exist!");
    }

    this.getProdMatList();
  }

  createMaterialOpen(content) {
    this.editMaterial = new MaterialCode();

    this.modalOpen(content);
  }

  editMaterialOpen(content, materialId: number) {
    let materialToEdit = this.materialCodes.find(m => m.materialCodeId == materialId);

    this.editMaterial = new MaterialCode();
    this.editMaterial.materialCodeId = materialToEdit.materialCodeId;
    this.editMaterial.code = materialToEdit.code;
    this.editMaterial.color = materialToEdit.color;
    this.editMaterial.karat = materialToEdit.karat;
    this.editMaterial.description = materialToEdit.description;

    this.modalOpen(content);
  }

  editSize: string = '0';

  editSizeOpen(content) {
    this.editSize = this.selectedProductsInfo.size;

    this.modalOpen(content);
  }

  newSize: ProductDetails = new ProductDetails();

  createSizeOpen(content) {
    this.newSize.matID = this.selectedProductsInfo.materialCodeId;

    this.newSize.productID = this.product.productsId;
    this.modalOpen(content);
  }

  createMatSizeOpen(content) {

    this.refreshRoutingList(this.product.productsId);

    this.modalOpen(content);
  }

  closeMatSizeOpen(content) {

    this.modalOpen(content);
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

  materialUpdate() {
    this.materialCodeService.update(this.editMaterial).subscribe(result => {
      let updatedMaterial = result.responseObject;
      let index = this.materialCodes.indexOf(this.materialCodes.find(m => m.materialCodeId == updatedMaterial.materialCodeId));
      this.materialCodes[index] = updatedMaterial;
      this.alertService.success('Updated material:' + updatedMaterial.description);
    }, error => {
      this.alertService.error(error.statusText);
    });
  }

  materialDelete() {
    this.materialCodeService.delete(this.editMaterial.materialCodeId).subscribe(result => {
      this.materialCodes = this.materialCodes.filter(m => m.materialCodeId != this.editMaterial.materialCodeId);
      this.alertService.success('Material deleted');
    }, error => {
      this.alertService.error(error.statusText);
    });
  }

  applyColorBand(product: Product) {
    let index = this.products.indexOf(product);
    if (index % 2 == 0 || index == 0) {
      return false;
    }
    return true;
  }

  searchPanelChange() {
    this.index = 1;
    this.alertService.clear();
    this.updateFlag = false;
    this.getProductSearch();
  }

  productImageList = [];
  imageListSize = 0;
  imageIndex = 0;

  nextImage() {
    this.imageIndex++;
    this.product.picPath = this.productImageList[this.imageIndex];
  }

  previousImage() {
    if (this.imageIndex !== 0) {
      this.imageIndex--;
      this.product.picPath = this.productImageList[this.imageIndex];
    }
  }

  loadProductImages() {

    this.productService.getProductImages(this.product.productsId).subscribe(imageList => {
      this.productImageList = [];
      this.productImageList = imageList.responseObject;
      this.imageListSize = this.productImageList.length - 1;
      this.imageIndex = this.productImageList.findIndex(x => x === this.product.picPath);
    }, error => {
      this.productImageList = [];
      this.imageListSize = 0;
      this.imageIndex = 0;
    });
  }

  viewSubassembly(subProductsId: number) {
    this.productService.viewSubassembly(subProductsId).subscribe(result => {
      this.products = result.responseObject;
      let product = this.products.find(p => p.productsId === subProductsId);
      this.selectedProductType = product.productsTypeId;
      this.getProductLocal(product);
    });

  }

  getProductLocal(product: Product) {
    this.product = product;

    this.productsStoreInfo = new ProductsStoreInfo();

    this.productsStoreInfo.productsId = this.product.productsId;

    if (this.product.productsStoreInfo !== undefined) {
      if (this.product.productsStoreInfo[0] !== undefined) {
        this.productsStoreInfo = this.product.productsStoreInfo[0];
      }
    }

    this.productsInfo = [];

    if (this.product.productsInfo.length > 0) {
      this.productsInfo = this.product.productsInfo;
      // this.getProdMatList();
    }

    // routing
    this.refreshRoutingList(this.product.productsId);
    this.productsRouting = [];
    if (this.product.productsRouting.length > 0) {
      this.productsRouting = this.product.productsRouting;
    }


    // Resets selected productInfo
    this.selectedMaterialCode = 0;
    this.selectedSize = '';

    this.getProdMatList();

    this.loadProductImages();

    if (this.product.picPath === null) {
      this.product.picPath = '../../../assets/images/no-image.png';
    }

    this.getHistoryLog(this.product.productsId);
    this.selectedCode = this.customers.find(c => c.custIdno == this.product.customerCode).custIdno;

  }

  timer;

  searchTimeout() {
    // clearTimeout(this.timer);
    // this.timer = setTimeout (() => {
    //   this.getProductSearch();
    // }, 1000);
    this.products = this.allProducts.filter(
      p => p.sku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.customerSku.toLowerCase().includes(this.searchString.toLowerCase())
        || p.productName.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  @ViewChild('productTable') private productTable: ElementRef;

  scrollToBottom() {
    this.productTable.nativeElement.scrollTop = this.productTable.nativeElement.scrollHeight;
  }

  allProducts: Product[] = [];

  get ProductPicPath() {

      //this.loadService.loadContent(true);
      if (this.product == undefined || this.product == null)
        this.product = new Product();

    return this.product.picPath;

  }

  getProductSearch(selectedProduct?: number) {
    let searchObject = new ProductSearch;
    this.sortColumn.forEach(s => { s.sort = ''; });

    //this.loadService.loadContent(true);
    if (this.product == undefined || this.product == null)
      this.product = new Product();

    this.product.customerCode = 0;
    if (this.selectedCustomer != 0) {
      this.product.customerCode = this.customers.find(c => c.custIdno == this.selectedCustomer).custIdno;
    }

    // todo : need to check drop down list
    if (this.updateFlag == true) {
      this.selectedProductType = this.product.productsTypeId;
    }

    searchObject.searchString = this.searchString;
    searchObject.customerCode = this.product.customerCode;
    searchObject.jewelryType = this.selectedJewelryType;
    searchObject.productTypeID = this.selectedProductType;

    console.log('Search Object', searchObject);

    this.index = 0;
    this.indexMax = 0;

    this.productService.getSearchList(searchObject).subscribe(response => {

      this.products = JSON.parse(response);
      this.allProducts = JSON.parse(response);


      if (this.allProducts.length = 0) {
        return;
      }

      this.products.forEach(item => {
        item = this.mapTypeNames(item);
      });

      this.products.sort((a, b) => {
        if (a.productsId > b.productsId) {
          return -1;
        }

        if (a.productsId < b.productsId) {
          return 1;
        }

        return 0;
      });

      if (this.products.length !== 0) {
        this.indexMax = this.products.length - 1;

        // this is where the juju happens
        // fixed if nothing is selected set the value for the products
          if (selectedProduct == undefined) {
          this.product = this.products[this.index];
        }

        this.refreshRoutingList(this.product.productsId);
        if (this.product.productsRouting.length > 0) {
          this.productsRouting = this.product.productsRouting;
        }

        this.loadProductImages();

        if (this.newMode) {
          this.product = this.products.find(p => p.productsId === selectedProduct);
          this.editMode = false;
          this.scrollToBottom();

        }
        else if (selectedProduct !== undefined) {
          this.product = this.products.find(p => p.productsId === selectedProduct);
        }

        // Added fetch when switching product type
        if (this.product == undefined)
          this.product = this.products[0];

      }
      else {
        this.product = new Product();
        this.alertService.error('No records found.');
        this.loadService.loadContent(false);
      }


      if (this.product.picPath === undefined || this.product.picPath === null) {
        this.product.picPath = '../../../assets/images/no-image.png';
      }

      if (this.product.productsInfo != undefined && this.product.productsInfo.length > 0) {
        this.productsInfo = this.product.productsInfo;
        this.getProdMatList();
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

    if (product.jewelryType != null) {
      product.jewelryTypeName = this.jewelryTypes.find(jt => jt.jewelryTypeId === product.jewelryType).type;
    }

    return product;
  }

  newSave() {
    if (this.isAuthorized) {
      this.productService.saveProduct(this.product).subscribe(response => {
        this.product = response.responseObject;
      }, error => {
        this.alertService.error('Error: Unable to save Product. ' + error.error.errorText);
      });
    }
    else{
      this.pagePermissionError();
    }
  }

  save() {
    if(this.isAuthorized){
      if (this.checkStringIfEmpty(this.product.sku) || this.checkStringIfEmpty(this.product.productName)) {
        this.error.sku = this.checkStringIfEmpty(this.product.sku);
        this.error.name = this.checkStringIfEmpty(this.product.productName);
      }
      else {
        this.update();
        this.getHistoryLog(this.product.productsId);
      }
    }
    else{
      this.pagePermissionError();
    }
  }

  updatePrimaryImage() {
    this.loadService.loadContent(true);
    this.productService.updatePrimaryImage(this.product).subscribe(result => {
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error('Error: Unable to update primary image. ' + error.error.errorText);
      this.loadService.loadContent(false);
    });
  }

  deleteImage() {
    this.loadService.loadContent(true);
    this.productService.deleteImage(this.product).subscribe(result => {
      this.loadProductImages();
      this.product.picPath = result.responseObject.picPath;
      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error('Error: Unable to delete image. ' + error.error.errorText);
      this.loadService.loadContent(false);
    });
  }

  setMetalGrainToProductInfo(){
    this.product.productsInfo
      .find(x => x.productsInfoId == this.selectedProductsInfo.productsInfoId).metalGrainsId = this.selectedMetalGrain.metalGrainsId;
  }

  update() {
    if(this.isAuthorized){
      this.product.customerCode = this.customers.find(c => c.custIdno == this.selectedCode).custIdno;
      this.product.createdBy = this.loggedUser;

      this.product.productsStoreInfo = [];
      this.productsStoreInfo.productsId = this.product.productsId;
      this.product.productsStoreInfo.push(this.productsStoreInfo);

      this.updateProductInfoList();

      this.productService.updateProduct(this.product).subscribe(response => {
        this.alertService.clear();
        this.editMode = false;
        this.alertService.success('Product details UPDATED.');

        this.updateFlag = true;
        this.getProductSearch(this.product.productsId);

        this.getProductLocal(this.product);

      }, error => {
        this.editMode = false;
        this.alertService.error(error.statusText + '. ' + (error.error.errorText !== undefined ? error.error.errorText : ''));
        this.loadService.loadContent(false);
      });
    }
    else{
      this.pagePermissionError();
    }

  }

  toggleEdit() {
    if(this.isAuthorized){
      this.editMode = !this.editMode;
      this.showEditModeSizes = false;
      if(this.editMode){
        this.metalGrainControl.enable();
      }
      else{
        this.metalGrainControl.disable();
      }
      
      this.refreshRoutingList(this.product.productsId);
      if (this.product.productsInfo != undefined &&
        this.product.productsInfo.length > 0) {

        this.productsInfo = this.product.productsInfo;
        this.getProdMatList();
      }

      if (this.editMode === false || this.newMode) {
        this.error.sku = false;
        this.error.name = false;
        this.newMode = false;
      }
    }
    else{
      this.pagePermissionError();
    }
  }


  toggleCancel() {
    // this.editMode = !this.editMode;
    // this.showEditModeSizes = false;
    this.toggleEdit();
    this.selectedMetalGrain = new MetalGrain();

    if (this.newMode == true) {
      this.deleteProduct();
    }

    if (this.product.productsInfo != undefined &&
      this.product.productsInfo.length > 0) {

      this.productsInfo = this.product.productsInfo;
      this.getProdMatList();
    }

    if (this.editMode === false || this.newMode) {
      this.error.sku = false;
      this.error.name = false;
      this.newMode = false;

    }
  }

  productMaterialCodes = [];

  isProductMaterials(matCodeId: number) {
    var materials = this.productMaterialCodes.filter(mat => mat.materialCodeId === matCodeId);
    if (materials.length > 0) {
      return true;
    }
    return false;
  }

  highlightSizes(materialCodeId: number) {

    if (this.productsInfo.length > 0 && this.selectedSize != '') {

      var sizes = this.productsInfo.find(x => x.size === this.selectedSize);

      if (sizes !== undefined) {

        this.highlightSize = true;
        return true;
      }

    }
    return false;
  }

  highlightMaterials(size: string) {

    if (this.selectedMaterialCode !== 0) {

      //  var materials = this.lstMatCodeSize.filter(mat => mat.matID == this.productDetails.matID);
      var materials = this.productsInfo.filter(info => info.materialCodeId == this.selectedMaterialCode);

      if (materials !== undefined) {

        var filtered = materials.find(mat => mat.size == size);

        if (filtered !== undefined) {

          this.highlightMats = true;

          return true;
        }
      }
    }

    return false;
  }

  matHasSize(item) {
    let materials = this.productsInfo.filter(x => x.size == this.selectedSize);
    let matHasSize = materials.find(x => x.materialCodeId == item);
    if(matHasSize !== undefined) {
      return true;
    }
    return false;
  }

  sizeInMat(size: string){
    let material = this.productsInfo.find(x => x.materialCodeId == this.selectedMaterialCode && x.size == size);
    if(material != undefined){
      return true;
    }
    return false;
  }

  newProduct() {
    if(this.isAuthorized){
      this.product = new Product();
      this.productsStoreInfo = new ProductsStoreInfo();
      this.selectedProductsInfo = new ProductsInfo();

      this.productsInfo = [];
      this.productImageList = [];

      this.product.sku = 'NEW_SKU';
      this.product.productName = 'NEW_ITEM';

      this.product.productsTypeId = this.selectedProductType;
      this.product.createdBy = this.loggedUser;

      this.getProdMatList();

      this.newSave();

      this.selectedCode = this.customers.find(c => c.custIdno == this.product.customerCode).custIdno;
      this.newMode = true;
      this.editMode = true;
    }
    else{
      this.pagePermissionError();
    }
  }

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

  uploadProductImage(files) {
    if (files.length === 0) {
      return;
    }

    this.loadService.loadContent(true);

    const formData = new FormData();

    for (var i = 0; i < files.length; i++) {
      formData.append("file[]", files[i]);
    }

    formData.append("productId", this.product.productsId.toString());
    formData.append("sku", this.product.sku);

    this.productService.uploadImage(formData).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        console.log('Uploading: ' + Math.round(100 * event.loaded / event.total) + '%');
      }
      else if (event.type === HttpEventType.Response) {

        this.productService.getProductImages(this.product.productsId).subscribe(imageList => {
          this.productImageList = imageList.responseObject;
          this.product.picPath = this.productImageList[0];
          this.imageListSize = this.productImageList.length - 1;
          this.imageIndex = this.productImageList.findIndex(x => x === this.product.picPath);
        }, error => {
          this.productImageList = [];
          this.imageListSize = 0;
          this.imageIndex = 0;
        });

        this.loadService.loadContent(false);
      }
      this.imageUploader.nativeElement.value = null;
    }, error => {
      this.alertService.error(error.error);
      this.loadService.loadContent(false);
      this.imageUploader.nativeElement.value = null;
    });

  }

  getMaterialDesc(matId: number): string {

    return this.materialCodes.filter(x => x.materialCodeId == matId)[0].description;
  }

  showMetalGrainsDropdown: boolean = false;

  getSelectedProductsInfo() {
    this.metalGrainsDropdown = this._metalGrains.filter(x => x.materialCode == this.selectedMaterialCode);
    this.selectedProductsInfo = new ProductsInfo();

    if (this.selectedMaterialCode != 0 && this.selectedSize != '') {
      this.selectedProductsInfo = this.productsInfo.filter(x => x.materialCodeId == this.selectedMaterialCode
        && x.size == this.selectedSize)[0];
      if(this.selectedProductsInfo != undefined){
        if(this.selectedProductsInfo.metalGrainsId != null && this.selectedProductsInfo.metalGrainsId != 0){
          this.showMetalGrainsDropdown = true;
          this.selectedMetalGrain = this._metalGrains.find(x => x.metalGrainsId == this.selectedProductsInfo.metalGrainsId);
        }
        else{
          this.showMetalGrainsDropdown = false;
          this.selectedMetalGrain = new MetalGrain();
        }
      }
      else{
        this.showMetalGrainsDropdown = false;
        this.selectedMetalGrain = new MetalGrain();
        this.selectedSize = this.productsInfo.filter(x => x.materialCodeId == this.selectedMaterialCode)[0].size;
        this.getSelectedProductsInfo();
      }

      if (this.selectedProductsInfo == undefined) {
        this.selectedProductsInfo = new ProductsInfo();
      }

    }
    else{
      this.showMetalGrainsDropdown = false;
      this.selectedMetalGrain = new MetalGrain();
    }

  }

  updateProductInfoList() {

    if (this.productsInfo.length > 0) {

      let index = this.productsInfo.findIndex(d => d.productsInfoId === this.selectedProductsInfo.productsInfoId);

      if (index != -1) {
        this.productsInfo.splice(index, 1);
        this.selectedProductsInfo.metalGrainsId = this.selectedMetalGrain.metalGrainsId;
        this.productsInfo.push(this.selectedProductsInfo);
      }

      this.product.productsInfo = this.productsInfo;

    }

    if (this.productsRouting.length > 0) {
      this.product.productsRouting = [];
      this.product.productsRouting = this.productsRouting;
    }

  }

  getProdMatList() {

    if (this.productsInfo.length > 0) {
      this.prodMatList = this.productsInfo.map(x => parseInt(x.materialCodeId.toString()))
        .filter((value, index, self) => self.indexOf(value) === index);

      this.prodSizeList = this.productsInfo.map(x => x.size)
        .filter((value, index, self) => self.indexOf(value) === index);

      if (this.prodMatList.length > 0 && this.prodSizeList.length > 0) {
        this.selectedSize = this.productsInfo[0].size;
        this.selectedMaterialCode = this.productsInfo[0].materialCodeId;

        //this.selectedSize
        //this.selectedMaterialCode
        this.highlightMaterials(this.selectedSize);
        this.highlightSizes(this.selectedMaterialCode);

        this.getSelectedProductsInfo();
      }

    }
    else {
      this.selectedSize = '';
      this.selectedMaterialCode = 0;
      this.selectedProductsInfo = new ProductsInfo();
      this.prodMatList = [];
      this.prodSizeList = [];
    }

  }

  deleteProduct() {

    this.productService.deleteProduct(this.product.productsId)
      .subscribe(res => {
        res
      }
        , err => {
        });

    this.product = new Product();

  }

  getHistoryLog(id: number) {
    this.productService.lastupdate(id).subscribe(
      res => {

        if (res != null) {
          this.lastUpdated = res;
        }
        else {
          this.lastUpdated = new Historylogs();
        }
      },
      err => {
      });
  }

  formatDate(iDate: Date) {

    return this._date.transform(iDate, 'MM.dd.yyyy HH:mm');
  }

  // ********************** Product Routing Section **********************


  get EnableUpdateRouting() {
    return this.routingForms.value.length == 0;
  }

  updateProductRouting() {


    for (var i = 0; i < this.routingForms.controls.length; i++) {
        let fg = this.routingForms.controls[i];

      this.updateRouting(fg, i);      
    }

    this.showNotification('update');

  }

  addnewrouting() {

    let prodRouting = new ProductsRouting;

    prodRouting.productsRoutingId = 0;
    prodRouting.productsId = this.product.productsId;

    prodRouting.routingCodesId = 1;
    prodRouting.standardTime = 0;
    prodRouting.comment = "";

    this.routingForms.push(this.fb.group({
      productsRoutingId: [prodRouting.productsRoutingId],
      productsId: [prodRouting.productsId],
      routingCodesId: [prodRouting.routingCodesId],
      standardTime: [prodRouting.standardTime],
      comment: [prodRouting.comment]
    }));
  }

  deleteRouting(productsRoutingId, i) {

    if (productsRoutingId == 0)
      this.routingForms.removeAt(i);
    else if (confirm('Are you sure to delete this record ?'))
      this.productsRoutingService.delete(productsRoutingId)
        .subscribe(res => {
          this.refreshRoutingList(this.product.productsId);
          this.routingForms.removeAt(i);
          this.showNotification('delete');
        },
          err => {
            console.log("delete", err);
          });

  }

  updateRouting(fg: AbstractControl, i) {

      this.productsRoutingService.addupdate(fg.value)
        .subscribe(res => {

          //if (fg.value.productsRoutingId == 0)
          //  this.showNotification('insert');
          //else
          //  this.showNotification('update');

          fg.patchValue({ productsRoutingId: res.productsRoutingId });
        },
          err => {
          });

  }

  refreshRoutingList(productId: number) {

    this.productsRoutingService.getRoutingListByProduct(productId)
      .subscribe(res => {
        this.productsRouting = res;

        this.routingForms = this.fb.array([]);;
        (this.productsRouting as []).forEach((routing: ProductsRouting) => {
          this.routingForms.push(this.fb.group({
            productsRoutingId: [routing.productsRoutingId],
            productsId: [routing.productsId],
            routingCodesId: [routing.routingCodesId],
            standardTime: [routing.standardTime],
            comment: [routing.comment]
          }));
        });
      },
        err => {
        });
  }

  // this function name is rejected for some reason; weird bug!
  addProductRouting() {
    alert('weh');

    //let prodRouting: ProductsRouting;
    //prodRouting.productsId = this.product.productsId;

    //// Todo :
    //prodRouting.routingCodesId = 1;
    //prodRouting.standardTime = "00:00:00";
    //prodRouting.comment = "";

    //this.productsRouting.push(prodRouting);

    // this.showNotification('insert');
  }

  showNotification(category) {
    switch (category) {
      case 'insert':
        this.notification = { class: 'text-success', message: 'saved!' };
        break;
      case 'update':
        this.notification = { class: 'text-primary', message: 'updated!' };
        break;
      case 'delete':
        this.notification = { class: 'text-danger', message: 'deleted!' };
        break;

      default:
        break;
    }
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  getRoutingDescription(id: number) {
    return this.routingCodes.filter(x => x.routingCodesId == id)[0].activityDesc;
  }

  getProductName(id) {
    let productname = '';
    let product = this.allProducts.filter(x => x.productsId = id)[0];
    if (product != undefined) {
      productname = product.productName;
    }

    return productname;
  }


}
