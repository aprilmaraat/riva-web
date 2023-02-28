import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkOrderComponent } from './work-order.component';

describe('WorkOrderComponent', () => {
  let component: WorkOrderComponent;
  let fixture: ComponentFixture<WorkOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
