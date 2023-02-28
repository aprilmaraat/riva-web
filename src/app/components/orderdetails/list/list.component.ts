import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { map, startWith } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

import { GenericComponent } from './../../../components/generic/generic.component';
import { AuthService } from './../../../services/auth.service';
import { AlertService } from './../../../custom/_alert';
import { LoadService } from './../../..//custom/load-overlay/load-overlay.service';
import { MaterialCodeService } from 'src/app/services/material-code.service';

import { OrderdetailsService } from './../orderdetails.service';
import { ProductService } from 'src/app/services/product.service';

import { Product, ProductsInfo } from 'src/app/models/product';
import { OrdersDetails } from 'src/app/models/orders.model';
import { MaterialCode } from 'src/app/models/material-code';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'orderdetails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ListComponent extends GenericComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<OrdersDetails>;
  @ViewChild('newOrderDetailsTable') newTable: MatTable<OrdersDetails>;

  @Input() _ordersId: number;
  @Input() _customerId: number;

  products: Product[] = [];
  orderDetails: OrdersDetails[] = [];
  allProductsInfo: ProductsInfo[] = [];
  materialCodes: MaterialCode[] = [];

  dataSource: OrdersDetails[];
  columnsToDisplay = ['productsId', 'productsInfoId', 'qtyordered', 'qtyshipped', 'qtyinvoiced',
    'entryDate', 'dueDate', 'comment'];

  expandedElement: OrdersDetails | null;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private orderdetailsService: OrderdetailsService
    , private productService: ProductService
    , private materialCodeService: MaterialCodeService
    // , private changeDetectorRefs: ChangeDetectorRef
  ) {
    super(authService, loadService, alertService);
  }

  ngOnInit(): void {
    this.load(this._customerId, this._ordersId);
  }

  load(customerId, ordersId) {

    forkJoin(
      [
        this.productService.getList(),
        this.orderdetailsService.getByOrderId(ordersId),
        this.productService.getProductsInfoList(),
        this.materialCodeService.getList(),
      ]
    ).pipe(
      map(([productList, orderdetailsList, allproductsinfo, materialCodes]) => {
        this.products = productList.filter(p => p.customerCode == customerId || p.customerCode == 5);
        this.orderDetails = orderdetailsList;
        this.allProductsInfo = allproductsinfo;
        this.materialCodes = materialCodes.responseObject;
        this.dataSource = this.orderDetails;
        return { productList, orderdetailsList, allproductsinfo };
      })
    ).subscribe(res => {
      console.log('Data Source', this.dataSource);
    });
  }

  getProductName(id) {
    let productname = '';
    let product = this.products.filter(x => x.productsId == id)[0];
    if (product != undefined) {
      productname = product.productName;
    }

    return productname;
  }

  getProductInfoDescByID(productsInfoId) {
    let materialsize = ''
    let productInfo = this.allProductsInfo.filter(x => x.productsInfoId == productsInfoId)[0];
    if (productInfo != undefined) {
      materialsize = this.getProductInfoDesc(productInfo.materialCodeId, productInfo.size);
    }

    return materialsize
  }

  getProductInfoDesc(materialCodeId: number, size: string) {
    let returnStr = ''

    if (materialCodeId == undefined) {
      return returnStr;
    }

    let materialCode = this.materialCodes.filter(x => x.materialCodeId == materialCodeId)[0];

    returnStr = materialCode.code + '  |  SZ-' + size;

    return returnStr;
  }

  newExpandedElement: OrdersDetails | null;
  newOrderDetails: OrdersDetails[] = [];

  newOrderDetail(){
    let newOrderDetail = new OrdersDetails();
    newOrderDetail.ordersId = this.orderDetails[0].ordersId;
    newOrderDetail.custAdrsId = this.orderDetails[0].custAdrsId;
    // newOrderDetail.productsId = this.orderDetails[0].productsId;
    this.newOrderDetails.push(newOrderDetail);
    this.newTable.renderRows();
  }

}
