// HAD TO RETAIN OLD CUSTOMER TABLE TO PREVENT ERRORS - 01/18/2021
//export class Customers{
//    custIdno: number;
//    customerId: string;
//    companyName: string;
//    contactName: string;
//    emailAddress: string;
//    address1: string;
//    address2: string;
//    city: string;
//    region: string;
//    postalCode: string;
//    country: string;
//    phone: string;
//    fax: string;
//    shippingMethod: string;
//    paymentTerms: string;
//}

export class Customers {
  custIdno: number;
  customerId: string = '';
  companyName: string = '';
  contactName: string = '';
  emailAddress: string = '';
  paymentTerms: string = '';
  leadtimeDays: number;
  customersAddresses: CustomersAddresses[];
  picPath: string = '';
}

export class CustomersAddresses {
  customersAddressesId: number;
  custIdno: number;
  defaultAddress: boolean = true;
  address1: string = '';
  address2: string = '';
  city: string = '';
  region: string = '';
  postalCode: string = '';
  country: string = '';
  phone: string = '';
  fax: string = '';
  shippingMethod: string = '';
}
