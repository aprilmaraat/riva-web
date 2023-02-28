import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrderImportingComponent } from './orderimporting.component';

describe('OrderComponent', () => {
  let component: OrderImportingComponent;
  let fixture: ComponentFixture<OrderImportingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrderImportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderImportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
