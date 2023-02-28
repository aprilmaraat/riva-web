import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GemsBomComponent } from './gems-bom.component';

describe('GemsComponent', () => {
  let component: GemsBomComponent;
  let fixture: ComponentFixture<GemsBomComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GemsBomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GemsBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
