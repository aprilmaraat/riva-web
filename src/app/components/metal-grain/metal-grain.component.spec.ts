import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetalGrainComponent } from './metal-grain.component';

describe('MetalGrainComponent', () => {
  let component: MetalGrainComponent;
  let fixture: ComponentFixture<MetalGrainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MetalGrainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetalGrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
