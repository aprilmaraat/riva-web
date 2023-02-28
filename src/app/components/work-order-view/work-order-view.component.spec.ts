import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkOrderViewComponent } from './work-order-view.component';

describe('WorkOrderViewComponent', () => {
  let component: WorkOrderViewComponent;
  let fixture: ComponentFixture<WorkOrderViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
