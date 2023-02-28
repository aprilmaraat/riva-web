import { Component, OnInit } from '@angular/core';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormArray, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { GenericComponent } from '../generic/generic.component';
import { AlertService } from 'src/app/custom/_alert';
import { AuthService } from 'src/app/services/auth.service';


import { customerCodeNavigation, Material } from '../../models/product';
import { Customers, CustomersAddresses } from 'src/app/models/customer';
import { CustomerService } from 'src/app/services/customer.service';
import { Product, ProductsInfo } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { Orders, OrdersDetails, OrderStatus } from 'src/app/models/orders.model';
import { OrderService } from 'src/app/services/order.service';
import { OrderdetailsService } from 'src/app/services/orderdetails.service';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-orderview',
  templateUrl: './orderview.component.html',
  styleUrls: ['./orderview.component.scss']
})
export class OrderviewComponent extends GenericComponent implements OnInit{

  editMode: boolean = false;
  hideOrderDetails: boolean = true;

  customersList: Customers[];
  selectedCustomer = new Customers;
  selectedCustomerId: number = 0;

  productList: Product[];
  productPerCustomer: Product[];
  materialCodes: MaterialCode[];
  /// productsInfo

  customersAddresses: CustomersAddresses[];
  selectedCustomersAddresses = new CustomersAddresses;

  orderList: Orders[];
  ordersAllList: Orders[];
  selectedOrder = new Orders;
  orderDetailList: OrdersDetails[];

  orderStatusList: OrderStatus[]
  cancelledOrderIdx: number = 0;

  productsInfo: ProductsInfo[];
  allProductsInfo: ProductsInfo[];

    // Variable region -- END


  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private router : Router
    , private customerService: CustomerService
    , private productService: ProductService
    , private orderService: OrderService
    , private orderDetailService: OrderdetailsService
    , private materialCodeService: MaterialCodeService
    , private modalService: NgbModal
    , private fb: FormBuilder) {
    super(authService, loadService, alertService);
  }

  ngOnInit(): void {

    this.load();
  }

  load() {

    forkJoin(
      [
        this.customerService.getList(),
        this.productService.getList(),
        this.orderService.getList(),
        this.orderService.getListOrderStatus(),
        this.materialCodeService.getList(),
        this.productService.getProductsInfoList()
      ]
    ).pipe(
      map(([customerlist, productList, orderlist, orderStatList, materialCodes, productsinfo]) => {
        this.customersList = customerlist;
        this.selectedCustomer = this.customersList.length > 0 ? this.customersList[0] : null;

        this.orderList = orderlist;
        this.ordersAllList = orderlist;

        this.productList = productList;

        this.orderStatusList = orderStatList;

        this.materialCodes = materialCodes.responseObject;

        this.productsInfo = productsinfo;
        this.allProductsInfo = productsinfo;

        this.getOrderListbyCustomer();


        return { customerlist, productList, orderlist, orderStatList, materialCodes, productsinfo };
      })
    ).subscribe(response => {

      // console.log(response);

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  getOrderListbyCustomer() {
    if (this.ordersAllList.length > 0) {
      if (this.selectedCustomerId > 0) {
        this.orderList = this.ordersAllList.filter(x => x.customerId == this.selectedCustomerId);
      }
      else {
        this.orderList = this.ordersAllList;
      }
    }

    this.selectedOrder = this.orderList.length > 0 ? this.orderList[0] : new Orders;

  }

  searchCustomer() {
    this.selectedCustomer = this.customersList.filter(x => x.custIdno == this.selectedCustomerId)[0];
    this.getOrderListbyCustomer();
  }

  gotoOrders(ordersId) {
    this.router.navigate(['/main/orders/' + ordersId]);
  }



} // end tag
