import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderdetailsItemComponent } from './new-orderdetails-item.component';

describe('NewOrderdetailsItemComponent', () => {
  let component: NewOrderdetailsItemComponent;
  let fixture: ComponentFixture<NewOrderdetailsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewOrderdetailsItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderdetailsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
