import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { BomItemType } from 'src/app/models/enum/bom-item-type.enum';
import { MaterialCode } from 'src/app/models/material-code';
import { Product, ProductsBOM, ProductsInfo } from 'src/app/models/product';
import { BomResponse, BomTableAResponse, FabMethod } from 'src/app/models/product-bom-b';
import { AuthService } from 'src/app/services/auth.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { ProductBomService } from 'src/app/services/product-bom.service';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-bill-of-materials-a',
  templateUrl: './bill-of-materials-a.component.html',
  styleUrls: ['./bill-of-materials-a.component.scss']
})
export class BillOfMaterialsAComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private productBomService: ProductBomService
    , private materialCodeService: MaterialCodeService) {
      super(authService, loadService, alertService);
      this.load();
  }

  ngOnInit(): void {
  }

  materialCodes: MaterialCode[] = [];

  private _editModeInput: boolean = undefined;
  @Input() set editModeInput(data: boolean) {
    this._editModeInput = data;
    this.editMode = this._editModeInput;
    this.newTableAItem = [];
  }

  get editModeInput(): boolean {
    return this._editModeInput;
  }

  private _productInput: Product = undefined;
  @Input() set productInput(data: Product) {
    this._productInput = data;
    this.refreshProductData(this._productInput);
  }

  get productInput(): Product {
    return this._productInput;
  }

  refreshProductData(product: Product){
    if(product.productsId !== undefined){
      this.productBomService.getTableAList(this.productInput.productsId).subscribe(result => {
        this.tableA = result;
      });
    }
  }

  private _productInfoInput: ProductsInfo[] = [];
  @Input() set productInfoInput(data: ProductsInfo[]) {
    this._productInfoInput = data;
  }

  get productInfoInput(): ProductsInfo[]{
    return this._productInfoInput;
  }

  private _selectedProductInfoInput: ProductsInfo = undefined;
  @Input() set selectedProductInfoInput(data: ProductsInfo) {
    this._selectedProductInfoInput = data;
  }

  get selectedProductInfoInput(): ProductsInfo{
    return this._selectedProductInfoInput;
  }

  get distinctMaterials(): ProductsInfo[]{
    var materials: ProductsInfo[]  = [];
    this.productInfoInput.forEach(item => {
      let exist = materials.find(x => x.materialCodeId == item.materialCodeId);
      if(exist == undefined){
        materials.push(item);
      }
    });
    return materials;
  }

  getMaterialSizes(materialCodeId: number){
    let info = this.productInfoInput.filter(x => x.materialCodeId == materialCodeId);
    var result: ProductsInfo[] = [];
    if(info !== undefined){
      if(info.length != 0){
        info.forEach(item => {
          result.push(item);
        });
      }
    }
    return result;
  }

  tableA: BomResponse[] = [];
  keyword: string = '';
  tableAOptions: BomTableAResponse[] = [];
  fabMethods: FabMethod[] = [];

  load(){
    this.materialCodeService.getList().subscribe(result => {
      this.materialCodes = result.responseObject;
    });
    this.productBomService.getTableAOptions().subscribe(result => {
      this.tableAOptions = result;
    });
    this.productBomService.getFabMethods().subscribe(result => {
      this.fabMethods = result;
    });
  }

  showDropdown(show: boolean){
    if(show){
      document.getElementById('search-option').nextElementSibling.classList.remove('hidden');
    }
    else{
      document.getElementById('search-option').nextElementSibling.classList.add('hidden');
    }
    
  }

  newTableAItem: BomTableAResponse[] = [];

  // addToTableAItem(item: BomTableAResponse){
  //   this.newTableAItem.push(item);
  //   this.showDropdown(false);
  // }

  checkIfListed(subItemId: number, itemType: number){
    let item = this.tableA.find(x => x.subItemId == subItemId && x.itemType == itemType);
    let x = this.newTableAItem.find(x => x.id == subItemId && x.type == itemType);
    if(item !== undefined || x !== undefined){
      return true;
    }
    return false;
  }

  addToTableA(subItemId: number, itemType: number, qty: number){
    this.showAutosaveCounter = true;
    this.autosaveCounter += 1;
    let newBom = new ProductsBOM();
    newBom.productsId = this.productInput.productsId;
    newBom.subItemId = subItemId;
    newBom.bomItemTypeId = itemType;
    newBom.itemQty = qty;
    this.productBomService.addUpdate(newBom).subscribe(result => {
      this.tableA.push(result);
      this.newTableAItem = this.newTableAItem.filter(x => x.id != subItemId);
      this.autosaveCounter -= 1;
    }, error => {
      this.alertService.error('Unable to add item.');
      this.autosaveCounter -= 1;
    });
  }

  updateTableAItem(bom: BomResponse){
    if(bom.bomQty == 0){
      this.delete(bom.bomId);
    }
    else{
      this.showAutosaveCounter = true;
      this.autosaveCounter += 1;
      let updateBom = new ProductsBOM();
      updateBom.productsBomid = bom.bomId;
      updateBom.itemQty = bom.bomQty;
      updateBom.notes = bom.itemDescription;
      updateBom.productsInfoId = bom.productsInfoId;
      this.productBomService.addUpdate(updateBom).subscribe(result => {
        var updated = this.tableA.find(x => x.bomId == result.bomId);
        var index = this.tableA.indexOf(updated);
        this.tableA[index] = result;
        this.autosaveCounter -= 1;
      }, error => {
        this.alertService.error('Unable to add item.');
        this.autosaveCounter -= 1;
      });
    }
  }

  delete(bomId: number){
    this.showAutosaveCounter = true;
    this.autosaveCounter += 1;
    this.productBomService.delete(bomId, '').subscribe(result => {
      if(result.wasSuccess){
        this.tableA = this.tableA.filter(x => x.bomId != bomId);
      }
      this.autosaveCounter -= 1;
    });
  }

  getMaterial(materialCodeId: number){
    let x = this.materialCodes.find(x => x.materialCodeId == materialCodeId);
    if(x !== undefined){
      return x.description;
    }
    return '';
  }

}
