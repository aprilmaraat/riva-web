import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './custom/auth.guard';
import { AccountsTableComponent } from './components/accounts-table/accounts-table.component';
import { InventoryLogComponent } from './components/inventory-log/inventory-log.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { GemsComponent } from './components/gems/gems.component';
import { EnamelComponent } from './components/enamel/enamel.component';
import { PartnerComponent } from './components/partner/partner.component';
import { MetalGrainComponent } from './components/metal-grain/metal-grain.component';
import { FindingsComponent } from './components/findings/findings.component';
import { NonPreciousComponent } from './components/non-precious/non-precious.component';
import { ManufacturedMaterialsComponent } from './components/manufactured-materials/manufactured-materials.component';
import { ChainTabComponent } from './components/chain-tab/chain-tab.component';
import { OrdersComponent } from './components/orders/orders.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { OrderviewComponent } from './components/orderview/orderview.component';
import { WorkOrderViewComponent } from './components/work-order-view/work-order-view.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/main/products' },
  { path: 'login', component: LoginComponent },
  { path: 'main',
    children: [
      { path: 'orders/:ordersId', component: OrdersComponent, canActivate: [AuthGuard] },
      { path: 'ordersview', component: OrderviewComponent, canActivate: [AuthGuard] },
      { path: 'products', component: ProductsTableComponent, canActivate: [AuthGuard] },
      { path: 'gems', component: GemsComponent, canActivate: [AuthGuard] },
      { path: 'chain', component: ChainTabComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'items',
    children: [
      { path: 'findings', component: FindingsComponent, canActivate: [AuthGuard] },
      { path: 'metal-grains', component: MetalGrainComponent, canActivate: [AuthGuard] },
      { path: 'enamel', component: EnamelComponent, canActivate: [AuthGuard] },
      { path: 'nonprecious', component: NonPreciousComponent, canActivate: [AuthGuard] },
      { path: 'manufactured-materials', component: ManufacturedMaterialsComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'admin',
    children: [
      { path: 'partners', component: PartnerComponent, canActivate: [AuthGuard] },
      { path: 'accounts', component: AccountsTableComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'reports',
    children: [
      { path: 'work-order', component: WorkOrderViewComponent, canActivate: [AuthGuard] },
    ]
  },
  { path: 'inventory-log', component: InventoryLogComponent, canActivate: [AuthGuard] },
  { path: '', component: ForbiddenComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', redirectTo: '/forbidden' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
