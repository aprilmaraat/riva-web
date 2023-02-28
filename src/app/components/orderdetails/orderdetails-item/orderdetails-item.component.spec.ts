import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderdetailsItemComponent } from './orderdetails-item.component';

describe('OrderdetailsItemComponent', () => {
  let component: OrderdetailsItemComponent;
  let fixture: ComponentFixture<OrderdetailsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderdetailsItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderdetailsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
