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
import { Orders, OrdersDetails, OrderStatus} from 'src/app/models/orders.model';
import { OrderService } from 'src/app/services/order.service';
import { OrderdetailsService } from 'src/app/services/orderdetails.service';
import { MaterialCode } from 'src/app/models/material-code';
import { MaterialCodeService } from 'src/app/services/material-code.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent extends GenericComponent implements OnInit {

  // Variable region -- START
  editMode: boolean = false;
  hideOrderDetails: boolean = false;
  hidebtns : boolean = true;

  customersList: Customers[];
  selectedCustomer = new Customers;
  selectedCustomerId: number = 1;

  productList: Product[];
  productPerCustomer: Product[];
  productPerCustomer2: Product[];
  materialCodes: MaterialCode[];
  /// productsInfo

  customersAddresses: CustomersAddresses[];
  selectedCustomersAddresses = new CustomersAddresses;

  orderList: Orders[];
  ordersAllList: Orders[];
  selectedOrder = new Orders;
  orderDetailList: OrdersDetails[];
  selectedOrderId: number;

  orderStatusList: OrderStatus[]
  cancelledOrderIdx: number = 0;

  productsInfo: ProductsInfo[];
  allProductsInfo: ProductsInfo[];
  // orderDetailFlag: boolean = true;

  selectedOrdersDetails: OrdersDetails;
  dialogProductId: number;
  dialogProductsInfoId: number;

  disableFlag: boolean = true;

  // Variable region -- END


  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private router: Router
    , private route: ActivatedRoute
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
    this.loadwithParameter();

    this.setPagePermission('orders/:ordersId');
  }

  loadwithParameter() {
    this.route.params.subscribe((params: Params) => {
      if (params['ordersId'] !== undefined) {

        this.selectedOrderId = +params['ordersId'];

        this.load(this.selectedOrderId);

      }
    });
  }

  load(orderId) {

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

        this.orderList = orderlist;
        this.ordersAllList = orderlist;

        if (orderId == 0) {
          this.newOrder();
          this.hidebtns = false;
        }
        else {
          this.selectedOrder = this.ordersAllList.filter(x => x.ordersId == orderId)[0];
        }

        this.customersList = customerlist;
        this.selectedCustomer = this.customersList.filter(x => x.custIdno == this.selectedOrder.customerId)[0];
        this.setSelectedCustomersAddresses();

        this.productList = productList;

        this.orderStatusList = orderStatList;

        this.materialCodes = materialCodes.responseObject;

        this.productsInfo = productsinfo;
        this.allProductsInfo = productsinfo;

        //this.getOrderListbyCustomer();

        this.getOrderDetailList();

        return { customerlist, productList, orderlist, orderStatList, materialCodes, productsinfo };
      })
    ).subscribe(response => {

      this.refreshOrderDetailList();
      // console.log(response);

      this.loadService.loadContent(false);
    }, error => {
      this.alertService.error(error.statusText);
      this.loadService.loadContent(false);
    });
  }

  searchCustomer() {
    this.selectedCustomer = this.customersList.filter(x => x.custIdno == this.selectedCustomerId)[0];
    this.setSelectedCustomersAddresses();
    this.getOrderListbyCustomer();
  }

  setSelectedCustomersAddresses() {
    if (this.selectedCustomer.customersAddresses.length > 0) {
      this.customersAddresses = this.selectedCustomer.customersAddresses;
      this.selectedCustomersAddresses = this.customersAddresses.filter(x => x.defaultAddress == true)[0];
    }
  }

  getOrderDetailList() {
    if (this.selectedOrder.ordersDetails.length > 0) {
      this.orderDetailList = this.selectedOrder.ordersDetails;
    }
  }

  getOrderListbyCustomer() {
    if (this.ordersAllList.length > 0) {
      this.orderList = this.ordersAllList.filter(x => x.customerId == this.selectedCustomer.custIdno);    
    }

    this.selectedOrder = this.orderList.length > 0 ? this.orderList[0] : new Orders;

    this.refreshOrderDetailList();
  }

  //getPreviousProduct() {
  //  let index = this.orderList.findIndex(x => x.ordersId == this.selectedOrder.ordersId);

  //    if (index != 0) {
  //      this.selectedOrder = this.orderList[index - 1];

  //      this.refreshOrderDetailList();
  //  }

  //}

  //getNextProduct() {
  //  let index = this.orderList.findIndex(x => x.ordersId == this.selectedOrder.ordersId);

  //    if (index < this.orderList.length-1) {
  //      this.selectedOrder = this.orderList[index + 1];

  //      this.refreshOrderDetailList();
  //  }

  //}

  editOrder() {
    if(this.isAuthorized){
      this.cancelledOrderIdx = this.selectedOrder.ordersId;
      this.editMode = !this.editMode;
    }
    else{
      this.pagePermissionError();
    }
  }

  newOrder() {
    if(this.isAuthorized){
      this.cancelledOrderIdx = this.selectedOrder.ordersId;
      this.selectedOrder = new Orders;
      this.selectedOrder.entryDate = new Date;
      this.editMode = !this.editMode;
    }
    else{
      this.pagePermissionError();
    }
  }

  cancelChange() {
    this.selectedOrder = this.ordersAllList.filter(x => x.ordersId == this.cancelledOrderIdx)[0];

    this.editMode = !this.editMode;
  }

  saveOrder() {

    this.orderService.addupdate(this.selectedOrder).subscribe(res => {

      this.selectedOrder = res;

      this.alertService.success('Order successfully UPDATED.');

      this.gotoOrders(this.selectedOrder.ordersId);

      this.selectedCustomer = this.customersList.filter(x => x.custIdno == this.selectedOrder.customerId)[0];
      this.refreshOrderDetailList();

      // Need to refresh the order list per customer
      this.orderService.getOrderByCustomerId(this.selectedCustomer.custIdno).subscribe
        (res => {
          this.orderList = res;
        },
          err => {
            console.log('Error : Orders by Customer ', err)
          });


    }, err => {

        this.alertService.success('Order failed to UPDATED.');
      err
    });

    this.editMode = !this.editMode;
  }

  
  // Order details modal ---- START

  closeResult = '';

  orderDetails: OrdersDetails[] = [];
  notification = null;
  orderDetailsForm: FormArray = this.fb.array([]);

  get orderDetailFlag() {
    let val: boolean = true;

    if (this.orderList != undefined &&
      this.orderList.length > 0) {
      val = false;
    }

    return val;
  }

  modalOpen(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      // Add New Info
      //this.AddNewProductInfo();

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

  openOrderDetails() {

    if (this.orderList.length > 0) {

      this.hideOrderDetails = false;

      this.refreshOrderDetailList();
    }
    else {
      alert('Please create order first!');
    }

    //this.modalOpen(content);
  }

  closeMatSizeOpen(content) {

    this.modalOpen(content);
  }


  refreshOrderDetailList() {

    this.orderDetailList = [];
    this.orderDetailsForm = this.fb.array([]);

    // Added refresh product per customer
    this.productPerCustomer = this.productList.filter(x => x.customerCode == this.selectedCustomer.custIdno || x.customerCode == 5);

    this.productPerCustomer2 = this.productList.filter(x => x.customerCode == this.selectedCustomer.custIdno || x.customerCode == 5);



    //if (this.productPerCustomer != undefined && this.productPerCustomer.length > 0) {
    //  // this.getProductInfoById(this.productPerCustomer[0].productsId);
    //}

    if (this.selectedOrder.ordersId == 0) {
      return;
    }

    // Add Ajax how to fetch data per order id
    this.orderService.getOrderById(this.selectedOrder.ordersId).subscribe(
      res => {        
        // had to call this to refresh order list
        this.selectedOrder = res

        //console.log('this.selectedOrder', this.selectedOrder);

        if (this.selectedOrder.ordersDetails.length > 0) {
          this.orderDetailList = this.selectedOrder.ordersDetails;

          //console.log('this.orderDetailList', this.orderDetailList);

          (this.orderDetailList as []).forEach((detail: OrdersDetails) => {
            this.orderDetailsForm.push(this.fb.group({

              ordersDetailsId: [detail.ordersDetailsId],
              ordersId: [detail.ordersId],
              productsId: [detail.productsId],
              productsInfoId: [detail.productsInfoId],
              qtyordered: [detail.qtyordered],
              qtyshipped: [detail.qtyshipped],
              qtyinvoiced: [detail.qtyinvoiced],
              entryDate: [detail.entryDate],
              dueDate: [detail.dueDate],
              custAdrsId: [detail.custAdrsId],
              comment: [detail.comment],
              products: [detail.products]

            }));
          });


        }



      },
      err => {        
        console.log('ERR : Orders Get by Id', err)
      });




  }


  newDetails() {

    if (this.selectedOrder.ordersId == 0) {

      return;
    }

    let orderDetail = new OrdersDetails;

    orderDetail.ordersDetailsId = 0;
    orderDetail.ordersId = this.selectedOrder.ordersId;
    orderDetail.custAdrsId = this.selectedCustomer.customersAddresses[0].customersAddressesId;
    orderDetail.products = this.productList.find(x => x.customerCode == this.selectedOrder.customerId);
    orderDetail.entryDate = new Date;
    orderDetail.dueDate = this.selectedOrder.requiredDate;
    orderDetail.qtyshipped = 0;
    orderDetail.qtyinvoiced = 0;


    this.orderDetailsForm.push(this.fb.group({

      ordersDetailsId: [orderDetail.ordersDetailsId],
      ordersId: [orderDetail.ordersId],
      productsId: [orderDetail.productsId],
      productsInfoId: [orderDetail.productsInfoId],
      qtyordered: [orderDetail.qtyordered],
      qtyshipped: [orderDetail.qtyshipped],
      qtyinvoiced: [orderDetail.qtyinvoiced],
      entryDate: [orderDetail.entryDate],
      dueDate: [orderDetail.dueDate],
      custAdrsId: [orderDetail.custAdrsId],
      comment: [orderDetail.comment]
      // ,products: [orderDetail.products]

    }));


  }

  get EnableUpdateOrderDetails() {
    return this.orderDetailsForm.value.length == 0;
  }

  updateDetails(fg: AbstractControl, i) {

    // console.log('fg.value UPDATE >>>>>>>>>> ', fg.value);

    this.productsInfo = this.allProductsInfo;

    let orderDetail: OrdersDetails;

    orderDetail = fg.value;

    var checker = this.checkProductsInfo(orderDetail);
    if (checker == false)
      return;

    console.log('orderDetail', fg.value);

    this.orderDetailService.addupdate(fg.value)
      .subscribe(res => {

        if (fg.value.productsRoutingId == 0)
          this.showNotification('insert');
        else
          this.showNotification('update');

        //console.log('response freak', res);

        fg.patchValue({ ordersDetailsId: res.ordersDetailsId });

        this.refreshOrderDetailList();

      },
        err => {
          console.log("update order details", err)
        });



  }


  updateDetailsList() {

    //for (var i = 0; i < this.orderDetailsForm.controls.length; i++) {

    //  let fg = this.orderDetailsForm.controls[i];

    //  this.updateDetails(fg, i);
    //}



    //this.showNotification('update');

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

  deleteDetail(orderDetailsId, i)
  {

    if (orderDetailsId == 0)
      this.orderDetailsForm.removeAt(i);
    else if (confirm('Are you sure to delete this record ?'))
      this.orderDetailService.delete(orderDetailsId)
        .subscribe(res => {
          // this.refreshRoutingList(this.product.productsId);
          this.orderDetailsForm.removeAt(i);
          this.showNotification('delete');
        },
          err => {
            console.log("delete", err);
          });

  }

  //getProductInfoByClick(fg: AbstractControl) {

  //  // this.productsInfo = [];

  //  console.log('ORDER DETAILS', fg.value.productsId)

  //  let localInfo = this.productsInfo;

  //  this.productsInfo = [];

  //  this.productsInfo = localInfo.filter(x => x.productsId = fg.value.productsId);


  //}

  getProductInfoById(productId: number, fg: AbstractControl) {

    this.productsInfo = [];

    if (productId == undefined) {
      return;
    } 

    let selectedProduct = this.productPerCustomer.filter(x => x.productsId == productId)[0];

    if (selectedProduct != undefined) {

      // console.log('Product Check', selectedProduct);

      if (selectedProduct.productsInfo != undefined
        && selectedProduct.productsInfo.length > 0) {

        //console.log('GRRR');

        this.productsInfo = selectedProduct.productsInfo;

      }

    }
  }

  getProductInfoByProduct(productId: number) {

    this.productsInfo = [];

    if (productId == undefined) {
      return;
    }

    let selectedProduct = this.productPerCustomer.filter(x => x.productsId == productId)[0];

    if (selectedProduct != undefined) {

      this.dialogProductId = productId;

      // console.log('Product Check', selectedProduct);

      if (selectedProduct.productsInfo != undefined
        && selectedProduct.productsInfo.length > 0) {

/*        console.log(selectedProduct);*/

        this.productsInfo = selectedProduct.productsInfo;
        this.dialogProductsInfoId = selectedProduct.productsInfo[0].productsInfoId;
        

      }
      else {
        this.dialogProductsInfoId = 0;
      }

    }
  }

  getProductsByInfo(productInfo)
  {
    //this.productPerCustomer = this.productList.filter(x => x.productsId == productsId);

    //console.log('this.productList', productInfo);
  }

  getProductInfoDescByID(productsInfoId) {
    let materialsize = ''
    let productInfo = this.allProductsInfo.filter(x => x.productsInfoId == productsInfoId)[0];
    if (productInfo != undefined) {
      materialsize = this.getProductInfoDesc(productInfo.materialCodeId, productInfo.size);
    }

    return materialsize
  }


getProductInfoDesc(materialCodeId : number, size : string) {

    let returnStr = ''

    if (materialCodeId == undefined) {
      return returnStr;
    }

    let materialCode = this.materialCodes.filter(x => x.materialCodeId == materialCodeId)[0];

    returnStr = materialCode.code + '  |  SZ-' + size;

    return returnStr;
  }

  onUpdateOrderDetails(fg: AbstractControl, i) {

    this.updateDetails(fg, i);

  }

  checkProductsInfo(orderDetail: OrdersDetails) {

    let checker = false;
    let endMessage = " Please select Product first then Material and Sizes";
    let product = this.productPerCustomer.filter(x => x.productsId == orderDetail.productsId)[0];

/*    console.log("orderDetail checkerrrrrrrrrrrrrrrrrrrr", orderDetail);*/

    if (orderDetail.ordersDetailsId == 0) {
      alert("Please Input Product using the BLUE BUTTON");
      return false;
    }

    if (product.productsInfo.length > 0) {

      var check = product.productsInfo.filter(x => x.productsInfoId == orderDetail.productsInfoId)[0];

      if (check == undefined || check == null) {
        alert('Product and Material NOT match! ' + endMessage);
        return checker;
      }
    }
    else {
      alert("Product has NO Material and Sizes");
      return checker;
    }

    checker = true;
    return checker;
  }

  gotoOrdersView() {
    this.router.navigate(['/main/ordersview']);
  }

  gotoOrders(ordersId) {
    window.location.href = '/main/orders/' + ordersId;
  }

  editProductDetails(modalName, orderDetail) {

    this.selectedOrdersDetails = orderDetail;
    this.dialogProductId = orderDetail.productsId;
    this.dialogProductsInfoId = orderDetail.productsInfoId;

/*    console.log(this.selectedOrdersDetails);*/

    this.modalOpen(modalName)

    //alert(modalName);
    //alert(OrderDetailId);
  }

  saveDetailsFromDiaog() {

    this.selectedOrdersDetails.productsId = this.dialogProductId;
    this.selectedOrdersDetails.productsInfoId = this.dialogProductsInfoId;
    this.selectedOrdersDetails.qtyordered = this.selectedOrdersDetails.qtyordered == null ? 0 : this.selectedOrdersDetails.qtyordered;

    //console.log(this.dialogProductsInfoId);
    //console.log(this.selectedOrdersDetails);

    this.orderDetailService.addupdate(this.selectedOrdersDetails)
      .subscribe(res => {

        this.selectedOrdersDetails = res;

        if (this.selectedOrdersDetails.productsId == 0)
          this.showNotification('insert');
        else
          this.showNotification('update');

        //console.log('response freak', res);

        this.refreshOrderDetailList();

      },
        err => {
          console.log("update order details", err)
        });


  }

  setSelectedDialogProductsInfo(value) {
    this.dialogProductsInfoId = value;
  }

  getProductName(id) {

    let productname = '';
    let product = this.productList.filter(x => x.productsId == id)[0];
    if (product != undefined) {
      productname = product.productName;
    }

    return productname;
  }


  // Order details modal ---- END
}
