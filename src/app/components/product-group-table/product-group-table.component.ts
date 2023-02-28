import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, zip } from 'rxjs';
import { zipAll } from 'rxjs/operators';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { GroupItem, GroupItemRequest, Product, ProductsStoreInfo } from 'src/app/models/product';
import { AuthService } from 'src/app/services/auth.service';
import { ProductStoreInfoService } from 'src/app/services/product-store-info.service';
import { ProductService } from 'src/app/services/product.service';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-product-group-table',
  templateUrl: './product-group-table.component.html',
  styleUrls: ['./product-group-table.component.scss']
})
export class ProductGroupTableComponent extends GenericComponent implements OnInit {

  constructor(authService: AuthService, loadService: LoadService, alertService: AlertService
    , private productService: ProductService, private storeInfoService: ProductStoreInfoService, private modalService: NgbModal){
    super(authService, loadService, alertService);
    this.load();
  }

  ngOnInit(): void {
    this.setPagePermission('Web Admin');
  }

  groupParents: Product[] = [];

  load(){
    this.storeInfoService.getGroupParents().subscribe(response => {
      this.groupParents = response;
      if(response.length != 0){
        this.selectParent(this.groupParents[0]);
      }
    }, error => {
      this.alertService.error('Error loading group parents');
    });
    this.productService.getNotInGroup().subscribe(result => {
      this.notInGroup = result;
      this.allNotInGroup = this.notInGroup;
    });
  }

  selectedParent: Product = new Product();
  groupItems: Product[];

  selectParent(product: Product){
    if(!this.editMode){
      this.selectedParent = product;
      this.productService.getProductGroupItems(this.selectedParent.productsStoreInfo[0].productsGroupId).subscribe(response => {
        this.groupItems = response;
      });
    }
  }

  searchString: string;
  allNotInGroup: Product[];

  searchTimeout(){
    this.notInGroup = this.allNotInGroup.filter(
      p => p.productName.toLowerCase().includes(this.searchString.toLowerCase())
    );
  }

  reorderGroupItems(product: Product, index: number){
    this.editMode = true;
    if(this.groupItems.indexOf(product) > 0 || this.groupItems.indexOf(product) < (this.groupItems.length - 1)){
      let itemIndex = this.groupItems.indexOf(product);
      let nextIndex = itemIndex + index;
      this.groupItems[itemIndex] = this.groupItems[nextIndex];
      this.groupItems[nextIndex] = product;
      // this.productService.reorderGroupItem(product.productsId, this.selectedParent.productsStoreInfo[0].productsGroupId, nextIndex + 1).subscribe(response => {
      //   // this.groupItems = response;
      // });
    }
  }

  // Not used
  refresh: number;

  createGroup(storeInfo: ProductsStoreInfo){
    console.log(storeInfo);
    this.productService.createGroup(storeInfo.productsId).subscribe(result => {
      this.load();
    });
  }

  newGroupItems: ProductsStoreInfo[] = [];
  groupItemRequest: GroupItemRequest = new GroupItemRequest();

  save(){
    if(this.isAuthorized){
      this.loadService.loadContent(true);

      if(this.groupItems.length != 0){
        this.groupItems.forEach(item => {
          let groupItem = new GroupItem();
          groupItem.productsId = item.productsId;
          groupItem.productsGroupId = item.productsStoreInfo[0].productsGroupId;
          groupItem.productsGroupLevel = this.groupItems.indexOf(item) + 1;
          this.groupItemRequest.groupItems.push(groupItem);
        });
    
        this.productService.updateGroupItems(this.groupItemRequest).subscribe(result => {
          this.groupItems = result;
          this.editMode = false;
          this.loadService.loadContent(false);
        });
      }
      else{
        this.productService.removeAllFromGroup(this.selectedParent.productsId).subscribe(result => {
          this.load();
          this.loadService.loadContent(false);
        }, error => {
          this.alertService.error('Error in saving group.');
        });
      }
    }
    else{
      this.pagePermissionError();
    }
  }

  addToGroup(storeInfo: ProductsStoreInfo){
    if(this.isAuthorized){
      this.editMode = true;
      storeInfo.productsGroupId = this.selectedParent.productsStoreInfo[0].productsGroupId;
      this.groupItems.push(this.notInGroup.find(x => x.productsId == storeInfo.productsId));
      this.notInGroup = this.notInGroup.filter(x => x.productsId != storeInfo.productsId);
      this.allNotInGroup = this.notInGroup.filter(x => x.productsId != storeInfo.productsId);
      this.newGroupItems.push(storeInfo);
    }
    else{
      this.pagePermissionError();
    }
  }

  removeGroup(product: Product){
    this.productService.removeFromGroup(product.productsId).subscribe(result => {
      this.groupParents = this.groupParents.filter(item => item.productsId != product.productsId);
      this.notInGroup.push(product);
      this.notInGroup.sort((a, b) => {
        if (a['productsId'] > b['productsId']) {
          return 1;
        }
        if (a['productsId'] < b['productsId']) {
          return -1;
        }
        return 0;
      });
      this.load();
    }, error => {
      this.alertService.error('Unable to delete group.');
    });
  }

  removeFromGroup(product: Product){
    this.groupItems = this.groupItems.filter(item => item.productsId != product.productsId);
    this.notInGroup.push(product);
    this.notInGroup.sort((a, b) => {
      if (a['productsId'] > b['productsId']) {
        return 1;
      }
      if (a['productsId'] < b['productsId']) {
        return -1;
      }
      return 0;
    });
  }

  editMode: boolean = false;

  toggleEdit(edit: boolean){
    this.editMode = edit;
  }

  cancelChanges(){
    this.groupParents = [];
    this.groupItems = [];
    this.editMode = false;
    this.load();
  }

  closeResult = '';

  notInGroup: Product[];

  open(value) {
    if(this.isAuthorized){
      this.modalService.open(value, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
    else{
      this.pagePermissionError();
    }
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
