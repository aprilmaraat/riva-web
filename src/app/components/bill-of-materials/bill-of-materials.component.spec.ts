import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BillOfMaterialsComponent } from './bill-of-materials.component';

describe('BillOfMaterialsComponent', () => {
  let component: BillOfMaterialsComponent;
  let fixture: ComponentFixture<BillOfMaterialsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
