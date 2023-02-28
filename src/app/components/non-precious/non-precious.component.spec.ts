import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NonPreciousComponent } from './non-precious.component';

describe('NonPreciousComponent', () => {
  let component: NonPreciousComponent;
  let fixture: ComponentFixture<NonPreciousComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NonPreciousComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonPreciousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
