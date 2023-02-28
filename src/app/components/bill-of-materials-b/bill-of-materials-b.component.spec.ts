import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BillOfMaterialsBComponent } from './bill-of-materials-b.component';

describe('BillOfMaterialsBComponent', () => {
  let component: BillOfMaterialsBComponent;
  let fixture: ComponentFixture<BillOfMaterialsBComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfMaterialsBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfMaterialsBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
