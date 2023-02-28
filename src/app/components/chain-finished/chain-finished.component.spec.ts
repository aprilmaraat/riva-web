import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChainFinishedComponent } from './chain-finished.component';

describe('ChainFinishedComponent', () => {
  let component: ChainFinishedComponent;
  let fixture: ComponentFixture<ChainFinishedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainFinishedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
