import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChainTabComponent } from './chain-tab.component';

describe('ChainTabComponent', () => {
  let component: ChainTabComponent;
  let fixture: ComponentFixture<ChainTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
