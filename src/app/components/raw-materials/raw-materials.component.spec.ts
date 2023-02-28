import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RawMaterialsComponent } from './raw-materials.component';

describe('RawMaterialsComponent', () => {
  let component: RawMaterialsComponent;
  let fixture: ComponentFixture<RawMaterialsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RawMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
