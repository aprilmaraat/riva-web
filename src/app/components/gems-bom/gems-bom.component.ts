import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { GemService } from '../../services/gem.service';
import { Gems, GemCuts, GemTypes, GemSizes, GemInventory } from '../../models/gems.model';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import * as cloneDeep from 'lodash/cloneDeep';
import { HttpEventType } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Suppliers } from '../../models/suppliers.model';
import { SupplierService } from 'src/app/services/supplier.service';



@Component({
  selector: 'app-gems-bom',
  templateUrl: './gems-bom.component.html',
  styleUrls: ['./gems-bom.component.scss']
})
export class GemsBomComponent extends GenericComponent implements OnInit {

  gemlist: GemInventory[];    // Data bind list
  allgemlist: GemInventory[]; // Stored list for dynamic binding

  gemCuts: GemCuts[] = []; // Gem Cuts
  gemTypes: GemTypes[] = [];
  allGemSizes: GemSizes[] = [];
  gemSizes: GemSizes[] = [];
  selectedCut = new GemCuts;
  selectedType = new GemTypes;
  selectedSize = new GemSizes;
  selectedInventory = new GemInventory;

  suppliers: Suppliers[];
  newSize: string = '';

  // This will control the behavior of the updating
  currentGem = new Gems;

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService,
    private gemSvc: GemService, private supplierService: SupplierService) {
    super(authService, loadService, alertService);
  }

  ngOnInit(): void {

    this.load();

  }

  load() {
    forkJoin(
      [
        this.gemSvc.getList(),
        this.gemSvc.getCutList(),
        this.gemSvc.getTypeList(),
        this.gemSvc.getSizeList(),
        this.supplierService.getList()
      ]
    ).pipe(
      map(([gemlist, cutlist, typelist, sizelist, suppliers]) => {
        this.gemlist = gemlist.responseObject;
        this.allgemlist = gemlist.responseObject;

        // console.log(this.allgemlist);

        this.gemCuts = cutlist.responseObject;
        if (this.gemCuts.length > 0) {
          this.selectedCut = this.gemCuts[0];
        }

        this.gemTypes = typelist.responseObject;
        if (this.gemTypes.length > 0) {
          this.selectedType = this.gemTypes[0];
        }

        this.allGemSizes = sizelist.responseObject;
        
        this.getupdatedSize();

        this.suppliers = suppliers;

        this.getSelectedInventory();

        return { gemlist, cutlist, typelist, sizelist, suppliers };
      })
    ).subscribe(response => {

      response
      // console.log(response);

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  getSelectedType(type: GemTypes) {
    this.selectedType = type;
    // console.log('selectedType  ', this.selectedType);

    this.getSelectedInventory();
  }

  getSelectedCut(cut: GemCuts) {
    this.selectedCut = cut;
    //console.log('selectedCut  ', this.selectedCut);

    this.getupdatedSize();

    this.getSelectedInventory();
  }

  getSelectedSize(size: GemSizes) {
    this.selectedSize = size;

    // console.log('selectedSize  ', this.selectedSize);

    this.getSelectedInventory();
  }

  getSelectedInventory() {

    // console.log(this.selectedType.gemTypesId, this.selectedCut.gemCutsId, this.selectedSize.gemSizesId);

    this.selectedInventory = new GemInventory();
    this.selectedInventory.gemTypesId = this.selectedType.gemTypesId;
    this.selectedInventory.gemCutsId = this.selectedCut.gemCutsId;
    if (this.selectedSize != null) {
      this.selectedInventory.gemSizesId = this.selectedSize.gemSizesId;
    }

    this.gemSvc.getGemInventory(this.selectedInventory).subscribe(
      res =>
      {
        this.selectedInventory = res.responseObject;

        // console.log('this.selectedInventory', this.selectedInventory);
      },
      err =>
      {
        console.log('getGemInventory ERROR ', err);
        err
      });

  }

  @Output() gemInventoryOutput = new EventEmitter<GemInventory>();

  saveInventory() {

    this.gemInventoryOutput.emit(this.selectedInventory);
  }

  addsize() {

    if (this.newSize == '')
      return;

    let gemsize = new GemSizes;
    gemsize.gemSizeDesc = this.newSize;
    gemsize.gemCutsId = this.selectedCut.gemCutsId;

    var gemcheck = this.allGemSizes.filter(x => x.gemSizeDesc == this.newSize && x.gemCutsId == gemsize.gemCutsId);
    if (gemcheck.length > 0) {
      this.alertService.clear();
      this.alertService.success('Duplicate GEM SIZE!');
      return;
    }

    this.gemSvc.addupdateSize(gemsize).subscribe(res => {
      this.allGemSizes.push(res);

      // console.log('this.allgemlist   >>>> ', this.allgemlist);

      this.getupdatedSize();

      this.getSelectedInventory();

      this.newSize = '';

      this.alertService.clear();
      this.alertService.success('Added NEW SIZE!');

    },
      err => {
        console.log('ERROR addupdateSize  > ', err);
      });

  }

  getupdatedSize() {

    this.gemSizes = this.allGemSizes.filter(x => x.gemCutsId == this.selectedCut.gemCutsId);
     
    // this.gemSizes = this.allGemSizes;
    if (this.gemSizes.length > 0) {

      this.selectedSize = this.gemSizes[0]
    }
    else {
      this.selectedSize = null;
    }

  }

  getHighlightedCut()
  {

    let value: Boolean = false;

    var gemInventory = this.gemlist.filter(x => x.gemTypesId == this.selectedType.gemTypesId
      && x.gemCutsId == this.selectedCut.gemCutsId)[0];

    if (gemInventory != null || gemInventory != undefined) {
      value = true;
    }

    return value;
  }

  getHighlightedCutbyCut(cut : GemCuts) {

    let value: Boolean = false;

    var gemInventory = this.gemlist.filter(x => x.gemTypesId == this.selectedType.gemTypesId
      && x.gemCutsId == cut.gemCutsId)[0];

    if (gemInventory != null || gemInventory != undefined) {
      value = true;
    }

    return value;
  }


  getHighlightedSizebyCut(item : GemSizes) {

    let value: Boolean = false;

    var gemInventory = this.gemlist.filter(x => x.gemTypesId == this.selectedType.gemTypesId
      && x.gemCutsId == this.selectedCut.gemCutsId
      && x.gemSizesId == item.gemSizesId)[0];

    if (gemInventory != null || gemInventory != undefined) {
      value = true;
    }

    return value;
  }

} // end class
