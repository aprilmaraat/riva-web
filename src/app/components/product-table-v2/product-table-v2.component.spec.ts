import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductTableV2Component } from './product-table-v2.component';

describe('ProductTableV2Component', () => {
  let component: ProductTableV2Component;
  let fixture: ComponentFixture<ProductTableV2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTableV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTableV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
