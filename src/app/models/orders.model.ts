import { Product, ProductsInfo } from './product';

export class Orders {
  ordersId: number = 0;
  pointernal: string = '';
  poexternal: string = '';
  receivedDate: Date;
  entryDate: Date;
  customerId: number = 1;
  requiredDate: Date;
  totalShippedDate: Date;
  orderStatusId: number = 1;
  comment: string = '';
  ordersDetails: OrdersDetails[];
  editflag = false;
  orderDetailsFlag = true;
}

export class OrdersDetails {
  ordersDetailsId: number = 0;
  ordersId: number = 0;
  productsId: number = 0;
  productsInfoId: number = 0;
  qtyordered: number = 0;
  qtyshipped: number = 0;
  qtyinvoiced: number = 0;
  entryDate: Date = new Date(Date.now());
  dueDate: Date = new Date(Date.now());
  custAdrsId: number = 0;
  comment: string = '';
  products: Product = new Product();
  productsInfo: ProductsInfo = new ProductsInfo;
}

export class OrderStatus {
  ordersStatusId: number;
  status: string;
}
