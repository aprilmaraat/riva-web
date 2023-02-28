import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { IvyCarouselModule } from 'angular-responsive-carousel';
// import { QRCodeModule } from 'angularx-qrcode';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { MatBadgeModule } from '@angular/material/badge';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import { GenericService } from './services/generic.service';
import { AuthService } from './services/auth.service';
import { LoadOverlayComponent, LoadContentOverlayComponent } from './custom/load-overlay/load-overlay.component';
import { AccountService } from './services/account.service';
import { NavComponent } from './custom/nav/nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderImportingComponent } from './components/orderimporting/orderimporting.component';
import { AccountsTableComponent } from './components/accounts-table/accounts-table.component';
import { NotificationComponent } from './custom/notification/notification.component';
import { AlertModule } from './custom/_alert';
import { InventoryLogComponent } from './components/inventory-log/inventory-log.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { EnumToArrayPipe } from './custom/pipes/enum-to-array.pipe';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { GemsComponent } from './components/gems/gems.component';
import { ProductTableV2Component } from './components/product-table-v2/product-table-v2.component';
import { ProductGroupTableComponent } from './components/product-group-table/product-group-table.component';
import { RawMaterialsComponent } from './components/raw-materials/raw-materials.component';
import { EnamelComponent } from './components/enamel/enamel.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { CustomerComponent } from './components/customer/customer.component';
import { PartnerComponent } from './components/partner/partner.component';
import { BillOfMaterialsBComponent } from './components/bill-of-materials-b/bill-of-materials-b.component';
import { BillOfMaterialsAComponent } from './components/bill-of-materials-a/bill-of-materials-a.component';
import { MetalGrainComponent } from './components/metal-grain/metal-grain.component';
import { FindingsComponent } from './components/findings/findings.component';
import { NonPreciousComponent } from './components/non-precious/non-precious.component';
import { ManufacturedMaterialsComponent } from './components/manufactured-materials/manufactured-materials.component';
import { ChainTabComponent } from './components/chain-tab/chain-tab.component';
import { ChainFinishedComponent } from './components/chain-finished/chain-finished.component';
import { ChainComponent } from './components/chain/chain.component';
import { GemsBomComponent } from './components/gems-bom/gems-bom.component';
import { BillOfMaterialsComponent } from './components/bill-of-materials/bill-of-materials.component';
import { OrdersComponent } from './components/orders/orders.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { ProductReportComponent } from './components/product-report/product-report.component';
import { NgxPrintModule } from 'ngx-print';
import { WorkOrderComponent } from './components/work-order/work-order.component';
import { OrderviewComponent } from './components/orderview/orderview.component';
import { WorkOrderViewComponent } from './components/work-order-view/work-order-view.component';
import { IdPipe } from './custom/pipes/id.pipe';
import { OrderdetailsModule } from './components/orderdetails/orderdetails.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotificationComponent,
    LoadOverlayComponent,
    LoadContentOverlayComponent,
    AccountsTableComponent,
    NavComponent,
    OrderImportingComponent,
    InventoryLogComponent,
    ProductsTableComponent,
    EnumToArrayPipe,
    GemsComponent,
    ProductTableV2Component,
    ProductGroupTableComponent,
    RawMaterialsComponent,
    EnamelComponent,
    SupplierComponent,
    CustomerComponent,
    PartnerComponent,
    BillOfMaterialsBComponent,
    BillOfMaterialsAComponent,
    MetalGrainComponent,
    FindingsComponent,
    NonPreciousComponent,
    ManufacturedMaterialsComponent,
    ChainTabComponent,
    ChainFinishedComponent,
    ChainComponent,
    GemsBomComponent,
    BillOfMaterialsComponent,
    OrdersComponent,
    ForbiddenComponent,
    ProductReportComponent,
    WorkOrderComponent,
    OrderviewComponent,
    WorkOrderViewComponent,
    IdPipe

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatSidenavModule,
    AlertModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    NgbModule,
    ClickOutsideModule,
    Ng2SearchPipeModule,
    MatTabsModule,
    NgxPrintModule,
    IvyCarouselModule,
    // QRCodeModule,
    NgxQRCodeModule,
    MatAutocompleteModule,
    MatBadgeModule,
    OrderdetailsModule
  ],
  exports: [
    EnumToArrayPipe,
    CurrencyPipe
  ],
  providers: [
    GenericService,
    AccountService,
    AuthService,
    DatePipe,
    IdPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
