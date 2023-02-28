import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnamelComponent } from './enamel.component';

describe('EnamelComponent', () => {
  let component: EnamelComponent;
  let fixture: ComponentFixture<EnamelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnamelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnamelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
