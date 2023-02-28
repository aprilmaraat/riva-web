import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManufacturedMaterialsComponent } from './manufactured-materials.component';

describe('ManufacturedMaterialsComponent', () => {
  let component: ManufacturedMaterialsComponent;
  let fixture: ComponentFixture<ManufacturedMaterialsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturedMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturedMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
