import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrderviewComponent } from './orderview.component';

describe('OrderviewComponent', () => {
  let component: OrderviewComponent;
  let fixture: ComponentFixture<OrderviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
