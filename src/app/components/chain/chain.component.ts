import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as cloneDeep from 'lodash/cloneDeep';
import { HttpEventType } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';

import { ChainService } from './../../services/chain.service';
import { Chain, ChainLinkSize, ChainType } from './../../models/chain.model';
import { Suppliers } from './../../models/suppliers.model';
import { SupplierService } from 'src/app/services/supplier.service';
import { MaterialCode } from './../../models/material-code';
import { MaterialCodeService } from './../../services/material-code.service';

@Component({
  selector: 'app-chain',
  templateUrl: './chain.component.html',
  styleUrls: ['./chain.component.scss']
})
export class ChainComponent extends GenericComponent implements OnInit {

  chainlist: Chain[];    // Data bind list
  allchainlist: Chain[]; // Stored list for dynamic binding

  chainTypes: ChainType[] = [];
  chainLinkSizes: ChainLinkSize[] = [];
  suppliers: Suppliers[];
  materialCodes: MaterialCode[];

  selectedChain = new Chain;
  selectedChainType: ChainType;
  selectedChainLinkSizes: ChainLinkSize;
  selectedMaterialCode: MaterialCode;

  newChainType: string;
  newChainLinkSizes: string;

  constructor(authService: AuthService,
            loadService: LoadService,
            alertService: AlertService,
            private chainService: ChainService,
            private supplierService: SupplierService,
            private materialCodeService: MaterialCodeService)
  {
    super(authService, loadService, alertService);
  }

  ngOnInit(): void {
    this.load();
    this.setPagePermission('Chain');
  }

  load() {
    forkJoin(
      [
        this.chainService.getList(),
        this.chainService.getListType(),
        this.chainService.getListLinkSize(),
        this.supplierService.getList(),
        this.materialCodeService.getList()
      ]
    ).pipe(
      map(([chainlist, chaintypes, chainlinksizes, suppliers, materialcodes]) => {
        this.chainlist = chainlist;
        this.allchainlist = chainlist;
        this.chainTypes = chaintypes;
        this.chainLinkSizes = chainlinksizes;
        this.suppliers = suppliers;
        this.materialCodes = materialcodes.responseObject;
        this.materialCodes = this.materialCodes.filter(x => parseInt(x.karat) >= 10 && parseInt(x.karat) <= 18);

        if (this.chainTypes.length > 0) {
          this.selectedChainType = this.chainTypes[0];
        }

        if (this.chainLinkSizes.length > 0) {
          this.selectedChainLinkSizes = this.chainLinkSizes[0];
        }

        this.selectedMaterialCode = this.materialCodes[0];

        this.getSelectedChainByCheck();
        
        return { chainlist, chaintypes, chainlinksizes, suppliers, materialcodes };
      })
    ).subscribe(response => {

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }


  getSelectedChainByCheck() {

    this.selectedChain = new Chain();
    this.selectedChain.chainTypeId = this.selectedChainType.chainTypeId;
    this.selectedChain.chainLinkSizeId = this.selectedChainLinkSizes.chainLinkSizeId;
    this.selectedChain.materialCode = this.selectedMaterialCode.materialCodeId;

    this.chainService.getChain(this.selectedChain).subscribe(
      res => {

        this.selectedChain = res;
        
      },
      err => {
        console.log('getSelectedChain ERROR ', err);
        err
      });

  }


  getSelectedChainType(chainType: ChainType) {
    this.selectedChainType = chainType;

     this.getSelectedChainByCheck();
  }

  getSelectedChainLinkSizes(chainlinksize: ChainLinkSize) {
    this.selectedChainLinkSizes = chainlinksize;

    this.getSelectedChainByCheck();
  }


  getSelectedMaterialCode(materialcode: MaterialCode) {
    this.selectedMaterialCode = materialcode;

    this.getSelectedChainByCheck();
  }

  saveChain() {

    // Fail safe in the event user puts decimal point on the quantity
    this.selectedChain.stockQty = parseInt(this.selectedChain.stockQty.toString());

    this.chainService.addupdate(this.selectedChain).subscribe(
      res => {
        this.selectedChain = res;

        this.chainService.getList().subscribe(ret => {
          this.chainlist = ret;
          this.allchainlist = ret;
        },
          err => {
            err
          });

        this.alertService.clear();
        this.alertService.success('CHAIN SAVED!');

      },
      error => {
        this.alertService.error(error.statusText + '. ' + (error.error.errorText !== undefined ? error.error.errorText : ''));
        this.loadService.loadContent(false);
      });
  }


  addchainType() {

    if (this.newChainType == '')
      return;

    let chaintype = new ChainType;
    chaintype.chainTypeName = this.newChainType;

    var check = this.chainTypes.filter(x => x.chainTypeName == this.newChainType);
    if (check.length > 0) {
      this.alertService.clear();
      this.alertService.success('Duplicate CHAIN TYPE!');
      return;
    }

    this.chainService.addchaintype(chaintype).subscribe(res => {
      this.chainTypes.push(res);

      this.getSelectedChainByCheck();

      this.newChainType = '';

      this.alertService.clear();
      this.alertService.success('Added NEW CHAIN TYPE!');

    },
      err => {
        console.log('ERROR addupdateSize  > ', err);
      });

  }


  addLinkSize() {

    if (this.newChainLinkSizes == '')
      return;

    let chainlinksize = new ChainLinkSize;
    chainlinksize.linkSize = this.newChainLinkSizes;

    var check = this.chainLinkSizes.filter(x => x.linkSize == this.newChainLinkSizes);
    if (check.length > 0) {
      this.alertService.clear();
      this.alertService.success('Duplicate CHAIN TYPE!');
      return;
    }

    this.chainService.addlinksize(chainlinksize).subscribe(res => {
      this.chainLinkSizes.push(res);

      this.getSelectedChainByCheck();

      this.newChainLinkSizes = '';

      this.alertService.clear();
      this.alertService.success('Added NEW CHAIN LINK SIZE!');

    },
      err => {
        console.log('ERROR addupdateSize  > ', err);
      });

  }


  getHighlightedLink(chainlinksize: ChainLinkSize) {

    let value: Boolean = false;

    var check1 = this.chainlist.filter(x => x.chainId == this.selectedChain.chainId)
    console.log('check1', check1);

    var check = this.chainlist.filter(x => x.chainId == this.selectedChain.chainId
      && x.chainLinkSizeId == chainlinksize.chainLinkSizeId)[0];

    console.log('check', check);

    if (check != null || check != undefined) {
      value = true;
    }

    return value;
  }

  getHighlightedMaterialCode(materialCode: MaterialCode) {

    let value: Boolean = false;

    var check = this.chainlist.filter(x => x.chainId == this.selectedChain.chainId
      && x.materialCode == materialCode.materialCodeId)[0];

    if (check != null || check != undefined) {
      value = true;
    }

    return value;
  }



}
