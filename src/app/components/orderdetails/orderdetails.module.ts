import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from './../../shared modules/app-material/app-material.module';
import { OrderdetailsItemComponent } from './orderdetails-item/orderdetails-item.component';
import { NewOrderdetailsItemComponent } from './new-orderdetails-item/new-orderdetails-item.component';


@NgModule({
  declarations: [ListComponent, OrderdetailsItemComponent, NewOrderdetailsItemComponent],
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports :[
    ListComponent
  ]
})
export class OrderdetailsModule { }
