import { TestBed } from '@angular/core/testing';

import { JewelryTypeService } from './jewelry-type.service';

describe('JewelryTypeService', () => {
  let service: JewelryTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JewelryTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
