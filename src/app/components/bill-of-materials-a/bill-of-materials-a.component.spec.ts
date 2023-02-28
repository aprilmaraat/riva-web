import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BillOfMaterialsAComponent } from './bill-of-materials-a.component';

describe('BillOfMaterialsAComponent', () => {
  let component: BillOfMaterialsAComponent;
  let fixture: ComponentFixture<BillOfMaterialsAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfMaterialsAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfMaterialsAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
