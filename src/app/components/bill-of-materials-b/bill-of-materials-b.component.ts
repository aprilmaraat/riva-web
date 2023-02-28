import { isNgTemplate } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { ChainFinishedColumns } from 'src/app/models/chainfinished.model';
import { Enamel, EnamelColumns } from 'src/app/models/enamel';
import { BomItemType } from 'src/app/models/enum/bom-item-type.enum';
import { FindingsColumn } from 'src/app/models/findings.model';
import { GemInventory, GemsColumns } from 'src/app/models/gems.model';
import { ManufacturedMatsColumns } from 'src/app/models/manufactured-materials';
import { MaterialCode } from 'src/app/models/material-code';
// import { MetalGrainColumn } from 'src/app/models/metal-grain';
import { NonpreciousColumns } from 'src/app/models/nonprecious.model';
import { Product, ProductsBOM, ProductsInfo } from 'src/app/models/product';
import { BomResponse } from 'src/app/models/product-bom-b';
import { Suppliers } from 'src/app/models/suppliers.model';
import { UnitOfMeasure } from 'src/app/models/unit-of-measure';
import { AuthService } from 'src/app/services/auth.service';
import { ChainfinishedService } from 'src/app/services/chainfinished.service';
import { ChainfinishedinfoService } from 'src/app/services/chainfinishedinfo.service';
import { EnamelService } from 'src/app/services/enamel.service';
import { FindingsService } from 'src/app/services/findings.service';
import { FindingsinfoService } from 'src/app/services/findingsinfo.service';
import { GemService } from 'src/app/services/gem.service';
import { ManufacturedMaterialsInfoService } from 'src/app/services/manufactured-materials-info.service';
import { ManufacturedMaterialsService } from 'src/app/services/manufactured-materials.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { MetalGrainService } from 'src/app/services/metal-grain.service';
import { NonPreciousService } from 'src/app/services/non-precious.service';
import { ProductBomService } from 'src/app/services/product-bom.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { UnitOfMeasureService } from 'src/app/services/unit-of-measurement.service';
import { GenericComponent } from '../generic/generic.component';

export class OptionSizes{
  id: number = 0;
  parentId: number = 0;
  materialCodeId: number = 0;
  size: string = '';
  subItemInfoId: number = 0;
}

//Refactor this
export class AllOptionSizes{
  id: number = 0;
  parentId: number = 0;
  materialCodeId: number = 0;
  size: string = '';
  subItemInfoId: number = 0;
  type: number = 0;
}

@Component({
  selector: 'app-bill-of-materials-b',
  templateUrl: './bill-of-materials-b.component.html',
  styleUrls: ['./bill-of-materials-b.component.scss']
})
export class BillOfMaterialsBComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private productBomService: ProductBomService
    , private gemService: GemService
    , private modalService: NgbModal
    , private enamelService: EnamelService
    , private manufacturedMatService: ManufacturedMaterialsService
    , private metalGrainSerivce: MetalGrainService
    , private findingService: FindingsService
    , private nonPreciousService: NonPreciousService
    , private supplierService: SupplierService
    , private uomService: UnitOfMeasureService
    , private materialCodeService: MaterialCodeService
    , private chainFinishedService: ChainfinishedService
    , private chainFinishedInfoService: ChainfinishedinfoService
    , private findingsInfoService: FindingsinfoService
    , private manufacturedMatsInfoService: ManufacturedMaterialsInfoService) {
      super(authService, loadService, alertService);
      this.loadSize();
  }

  ngOnInit(): void {
    this.load();
  }
 
  private _editModeInput: boolean = undefined;
  @Input() set editModeInput(data: boolean) {
    this._editModeInput = data;
    this.editMode = this._editModeInput;
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
      this.productBomService.getTableBList(this.productInput.productsId).subscribe(result => {
        this.tableB = result;
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

  tableB: BomResponse[] = [];
  suppliers: Suppliers[] = [];
  uom: UnitOfMeasure[] = [];
  materialCodes: MaterialCode[] = [];

  load(){
    this.supplierService.getList().subscribe(result => {
      this.suppliers = result;
    });
    this.uomService.getList().subscribe(result => {
      this.uom = result.responseObject;
    });
    this.materialCodeService.getList().subscribe(result => {
      this.materialCodes = result.responseObject;
    });
    if(this.productInput.productsId !== undefined){
      this.productBomService.getTableBList(this.productInput.productsId).subscribe(result => {
        this.tableB = result;
      });
    }
    
  }

  get tableB_filteredByMatSize(){
    if(this.selectedProductInfoInput.productsInfoId != undefined){
      return this.tableB.filter(b => (this.productInfoInput.find(i => i.productsInfoId == b.productsInfoId)?.size == this.selectedProductInfoInput.size)
        || b.productsInfoId == 0
        || b.productsInfoId == undefined
        || b.productsInfoId == null);
    }
    else{
      return [];
    }
  }

  enamels: Enamel[] = [];
  gems: GemInventory[] = [];
  bomType: number = BomItemType.Chain;
  popupTableB_ColumnNames = [];
  popupTableB_RowData = [];
  tableB_filtered = [];

  searchTimeout() {
    if(this.searchString == '') {
      // this.tableB_filtered = [];
      this.tableB_filtered = this.popupTableB_RowData;
    }
    else {
      let searchResult = [];

      if(this.bomType == BomItemType.Enamel){
        searchResult = this.popupTableB_RowData.filter(
          x => x['enamelSku'].toLowerCase().includes(this.searchString.toLowerCase())
            || x['enamelName'].toLowerCase().includes(this.searchString.toLowerCase())
          );
      }
      else{
        searchResult = this.popupTableB_RowData.filter(
          x => x['SKU'].toLowerCase().includes(this.searchString.toLowerCase())
            || x['Name'].toLowerCase().includes(this.searchString.toLowerCase())
          );
      }

      if(searchResult !== undefined){
        this.tableB_filtered = searchResult;
      }
    }
  }

  getDistinctOptionSizes(parentId: number): OptionSizes[]{
    var sizes: OptionSizes[]  = [];
    let filtered = [];
    filtered = this.sizeSelection.filter(x => x.parentId == parentId);
    filtered.forEach(item => {
      let exist = sizes.find(x => x.id == item.id);
      if(exist == undefined){
        sizes.push(item);
      }
    });
    return sizes;
  }

  sizeSelected = 0;
  sizeSelection: OptionSizes[] = [];
  allSizes: AllOptionSizes[] = [];

  getAllOptionSizes(id: number, type: number){
    let info = [];
    info = this.allSizes.filter(x => x.parentId == id && x.type == type);
    console.log('ID: ' + id + ' Type: ' + type);
    console.log(this.allSizes);
    this.tableB.forEach(item => {
      info = info.filter(x =>  x.parentId == id && x.id != item.subItemInfoId);
    });
    return info;
  }

  getOptionSizes(id: number){
    let info = [];
    info = this.sizeSelection.filter(x => x.parentId == id);
    this.tableB.forEach(item => {
      info = info.filter(x =>  x.parentId == id && x.id != item.subItemInfoId);
    });
    return info;
  }

  loadSize(){
    forkJoin(
      [
        this.chainFinishedInfoService.getList(),
        this.findingsInfoService.getList(),
        this.manufacturedMatsInfoService.getList(),
      ]
    ).pipe(
      map(([ chainInfos, findingInfos, manufacturedMatInfos ]) => {
        return { chainInfos, findingInfos, manufacturedMatInfos };
      })
    ).subscribe(response => {

      response.chainInfos.forEach(element => {
        let optionSize = new AllOptionSizes();
        optionSize.id = element.chainFinishedInfoId;
        optionSize.parentId = element.chainFinishedId;
        optionSize.materialCodeId = element.materialCodeId;
        optionSize.size = element.size;
        optionSize.type = BomItemType.Chain;
        if(this.allSizes.find(x => x.size == optionSize.size && x.type == BomItemType.Chain) == undefined){
          this.allSizes.push(optionSize);
        }
      });

      response.findingInfos.forEach(element => {
        let optionSize = new AllOptionSizes();
        optionSize.id = element.findingsInfoId;
        optionSize.parentId = element.findingsId;
        optionSize.materialCodeId = element.materialCodeId;
        optionSize.size = element.size;
        optionSize.type = BomItemType.Findings;
        if(this.allSizes.find(x => x.size == optionSize.size && x.type == BomItemType.Findings) == undefined){
          this.allSizes.push(optionSize);
        }
      });

      response.manufacturedMatInfos.forEach(element => {
        let optionSize = new AllOptionSizes();
        optionSize.id = element.findingsInfoId;
        optionSize.parentId = element.findingsId;
        optionSize.materialCodeId = element.materialCodeId;
        optionSize.size = element.size;
        optionSize.type = BomItemType.ManufacturedMats;
        if(this.allSizes.find(x => x.size == optionSize.size && x.type == BomItemType.Findings) == undefined){
          this.allSizes.push(optionSize);
        }
      });

    });
  }

  showTableBOptions(itemType: number){
    this.searchString = '';
    this.searchTimeout();
    this.sizeSelection = [];
    if(itemType == BomItemType.Chain){
      this.resetTableBPopupData(new ChainFinishedColumns());

      forkJoin(
        [
          this.chainFinishedService.getList(),
          this.chainFinishedInfoService.getList(),
        ]
      ).pipe(
        map(([ list, infoList ]) => {
          return { list, infoList };
        })
      ).subscribe(response => {
        let list = response.list;
        let columns: ChainFinishedColumns[] = [];

        let infoList = response.infoList;

        infoList.forEach(element => {
          let optionSize = new OptionSizes();
          optionSize.id = element.chainFinishedInfoId;
          optionSize.parentId = element.chainFinishedId;
          optionSize.materialCodeId = element.materialCodeId;
          optionSize.size = element.size;
          if(this.sizeSelection.find(x => x.size == optionSize.size) == undefined){
            this.sizeSelection.push(optionSize);
          }
        });

        list.forEach(element => {
          let column = new ChainFinishedColumns();
          column.ID = element.chainFinishedId;
          column.Name = element.name;
          column.SKU = element.sku;
          columns.push(column);
        });

        this.popupTableB_RowData = columns;
        this.tableB_filtered = this.popupTableB_RowData;

        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });
      
    }
    else if(itemType == BomItemType.Enamel){
      this.resetTableBPopupData(new EnamelColumns());

      this.enamelService.getList().subscribe(result => {
        this.popupTableB_RowData = result;
        this.tableB_filtered = this.popupTableB_RowData;
      }, error => {
        this.alertService.error('Error getting list of enamel.');
      });
    }
    else if(itemType == BomItemType.Findings){
      this.resetTableBPopupData(new FindingsColumn());
      
      forkJoin(
        [
          this.findingService.getList(),
          this.findingsInfoService.getList(),
        ]
      ).pipe(
        map(([ list, infoList ]) => {
          return { list, infoList };
        })
      ).subscribe(response => {
        let list = response.list;
        let columns: FindingsColumn[] = [];

        let infoList = response.infoList;

        infoList.forEach(element => {
          let optionSize = new OptionSizes();
          optionSize.id = element.findingsInfoId;
          optionSize.parentId = element.findingsId;
          optionSize.materialCodeId = element.materialCodeId;
          optionSize.size = element.size;
          if(this.sizeSelection.find(x => x.size == optionSize.size) == undefined){
            this.sizeSelection.push(optionSize);
          }
        });

        list.forEach(element => {
          let column = new FindingsColumn();
          column.ID = element.findingsId;
          column.Name = element.name;
          column.SKU = element.sku;
          column.Supplier = this.supplierName(element.suppliersId);
          column.Unit = this.getUom(element.unitsOfMeasureId);
          columns.push(column);
        });

        this.popupTableB_RowData = columns;
        this.tableB_filtered = this.popupTableB_RowData;

        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });

      // this.findingService.getList().subscribe(result => {
      //   let x = result;
      //   let columns: FindingsColumn[] = [];

      //   x.forEach(element => {
      //     console.log(element);
      //     let column = new FindingsColumn();
      //     column.ID = element.findingsId;
      //     column.Name = element.name;
      //     column.SKU = element.sku;
      //     column.Supplier = this.supplierName(element.suppliersId);
      //     column.Unit = this.getUom(element.unitsOfMeasureId);
      //     columns.push(column);
      //   });

      //   this.popupTableB_RowData = columns;
      //   this.tableB_filtered = this.popupTableB_RowData;
    }
    else if(itemType == BomItemType.ManufacturedMats){
      this.resetTableBPopupData(new ManufacturedMatsColumns());

      forkJoin(
        [
          this.manufacturedMatService.getList(),
          this.manufacturedMatsInfoService.getList(),
        ]
      ).pipe(
        map(([ list, infoList ]) => {
          return { list, infoList };
        })
      ).subscribe(response => {
        let list = response.list;
        let columns: ManufacturedMatsColumns[] = [];

        let infoList = response.infoList;

        infoList.forEach(element => {
          let optionSize = new OptionSizes();
          optionSize.id = element.manufacturedMaterialsInfoId;
          optionSize.parentId = element.manufacturedMaterialsId;
          optionSize.materialCodeId = element.materialCodeId;
          optionSize.size = element.size;
          if(this.sizeSelection.find(x => x.size == optionSize.size) == undefined){
            this.sizeSelection.push(optionSize);
          }
        });

        list.forEach(element => {
          let column = new ManufacturedMatsColumns();
          column.ID = element.manufacturedMaterialsId;
          column.Name = element.name;
          column.SKU = element.sku;
          column.Supplier = this.supplierName(element.suppliersId);
          column.Unit = this.getUom(element.unitsOfMeasureId);
          columns.push(column);
        });

        this.popupTableB_RowData = columns;
        this.tableB_filtered = this.popupTableB_RowData;

        this.loadService.loadContent(false);
      }, error => {
        this.alertService.error(error.statusText);
        this.loadService.loadContent(false);
      });

      // this.manufacturedMatService.getList().subscribe(result => {
      //   let x = result;
      //   let columns: ManufacturedMatsColumns[] = [];

      //   x.forEach(element => {
      //   let column = new ManufacturedMatsColumns();
      //   column.ID = element.manufacturedMaterialsId;
      //   column.Name = element.name;
      //   column.SKU = element.sku;
      //   column.Supplier = this.supplierName(element.suppliersId);
      //   column.Unit = this.getUom(element.unitsOfMeasureId);
      //   columns.push(column);
      // });

      // this.popupTableB_RowData = columns;
      // this.tableB_filtered = this.popupTableB_RowData;
      // }, error => {
      //   this.alertService.error('Error getting list of sheets and wires.');
      // });
    }
    // else if(itemType == BomItemType.MetalGrains){
    //   this.resetTableBPopupData(new MetalGrainColumn());

    //   this.metalGrainSerivce.getList().subscribe(result => {
    //     let x = result;
    //     let columns: MetalGrainColumn[] = [];

    //     x.forEach(element => {
    //       let column = new MetalGrainColumn();
    //       column.ID = element.metalGrainsId;
    //       column.Name = element.name;
    //       column.SKU = element.sku;
    //       column.Supplier = this.supplierName(element.suppliersId);
    //       column["Supplier SKU"] = element.supplierSku;
    //       column.Material = this.getMaterial(element.materialCode);
    //       column.Unit = this.getUom(element.unitsOfMeasureId);
    //       column["QTY in Stock"] = element.qtyinStock;
    //       column["QTY in Scrap"] = element.qtyinScrap;
    //       columns.push(column);
    //     });

    //     this.popupTableB_RowData = columns;
    //   }, error => {
    //     this.alertService.error('Error getting list of enamel.');
    //   });
    // }
    else if(itemType == BomItemType.Gems){
      this.resetTableBPopupData(new GemsColumns());

      this.gemService.getList().subscribe(result => {
        this.popupTableB_RowData = result.responseObject;
        this.tableB_filtered = this.popupTableB_RowData;
      }, error => {
        this.alertService.error('Error getting list of gems.');
      });
    }
    else if(itemType == BomItemType.Nonprecious){
      this.resetTableBPopupData(new NonpreciousColumns());

      this.nonPreciousService.getList().subscribe(result => {
        let x = result;
        let columns: NonpreciousColumns[] = [];

        x.forEach(element => {
          let column = new NonpreciousColumns();
          column.ID = element.nonPreciousId;
          column.Name = element.name;
          column.SKU = element.sku;
          column.Supplier = this.supplierName(element.suppliersId);
          column.Unit = this.getUom(element.unitsOfMeasureId);
          column["Stock QTY"] = element.stockQty;
          column["Supplier Price"] = element.supplierPrice;
          columns.push(column);
        });

        this.popupTableB_RowData = columns;
        this.tableB_filtered = this.popupTableB_RowData;
      }, error => {
        this.alertService.error('Error getting list of nonprecious materials.');
      });
    }

  }

  resetTableBPopupData(object: any){
    this.popupTableB_ColumnNames = [];
    this.popupTableB_ColumnNames = Object.keys(object);
    this.popupTableB_RowData = [];
    this.tableB_filtered = this.popupTableB_RowData;
  }

  checkIfListed(subItemId: number, itemType: number){
    let item = this.tableB.find(x => x.subItemId == subItemId && x.itemType == itemType);
    if(item !== undefined){
      return true;
    }
    return false;
  }

  addGemToTableB(input: GemInventory){
    let exist = this.tableB.find(x => x.subItemId == input.gemInventoryId && x.itemType == this.bomType);
    if(exist == undefined){
      this.addToTableB(input.gemInventoryId, this.bomType, 1);
    }
    else{
      this.alertService.error('Gem already in BOM table.');
    }
  }

  addToTableB(subItemId: number, itemType: number, qty: number, infoId?: number){
    // this.tableB_filtered = [];
    this.showAutosaveCounter = true;
    this.autosaveCounter += 1;
    let newBom = new ProductsBOM();
    newBom.productsId = this.productInput.productsId;
    newBom.subItemId = subItemId;
    newBom.bomItemTypeId = itemType;
    newBom.itemQty = qty;
    newBom.subItemInfoId = infoId;
    this.productBomService.addUpdate(newBom).subscribe(result => {
      this.tableB.push(result);
      this.modalService.dismissAll('Add item');
      this.autosaveCounter -= 1;
    }, error => {
      this.modalService.dismissAll('Error');
      this.alertService.error('Unable to add item.');
      this.autosaveCounter -= 1;
    });
  }

  updateTableBItem(bom: BomResponse){
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
      updateBom.sizeLocked = bom.isSizeDependent;
      updateBom.productsInfoId = 0;
      if(bom.isSizeDependent){
        updateBom.productsInfoId = this.selectedProductInfoInput.productsInfoId;
      }

      var updated = this.tableB.find(x => x.bomId == bom.bomId);
      var index = this.tableB.indexOf(updated);
      this.tableB[index] = bom;
      
      this.productBomService.addUpdate(updateBom).subscribe(result => {
        // var updated = this.tableB.find(x => x.bomId == result.bomId);
        // var index = this.tableB.indexOf(updated);
        // this.tableB[index] = result;
        this.modalService.dismissAll('Add item');
        this.autosaveCounter -= 1;
      }, error => {
        this.modalService.dismissAll('Error');
        this.alertService.error('Unable to add item.');
        this.autosaveCounter -= 1;
      });
    }
  }

  // updateSizeLock(productsBomId: number, productsInfoId: number){
  //   this.showAutosaveCounter = true;
  //   this.autosaveCounter += 1;
  //   let updateBom = new ProductsBOM();
  //   updateBom.
  // }

  delete(bomId: number){
    this.showAutosaveCounter = true;
    this.autosaveCounter += 1;
    this.productBomService.delete(bomId, '').subscribe(result => {
      if(result.wasSuccess){
        this.tableB = this.tableB.filter(x => x.bomId != bomId);
      }
      this.autosaveCounter -= 1;
    });
  }

  getPopupLabel(itemType: number){
    if(itemType == BomItemType.Chain){
      return 'Chain';
    }
    else if(itemType == BomItemType.Enamel){
      return 'Enamel';
    }
    else if(itemType == BomItemType.Findings){
      return 'Findings';
    }
    else if(itemType == BomItemType.Gems){
      return 'Gem';
    }
    else if(itemType == BomItemType.ManufacturedMats){
      return 'Manufactured Materials';
    }
    // else if(itemType == BomItemType.MetalGrains){
    //   return 'Metal Grains';
    // }
    else if(itemType == BomItemType.Nonprecious){
      return 'Nonprecious';
    }
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
    let x = this.uom.find(x => x.unitsOfMeasureId == uomId);
    if(x !== undefined){
      return x.uom;
    }
    return '';
  }

  getMaterial(materialCodeId: number){
    let x = this.materialCodes.find(x => x.materialCodeId == materialCodeId);
    if(x !== undefined){
      return x.description;
    }
    return '';
  }

  closeResult = '';

  openModal(value) {
    this.modalService.open(value, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
