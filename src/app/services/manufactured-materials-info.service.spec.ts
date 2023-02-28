import { TestBed } from '@angular/core/testing';

import { ManufacturedMaterialsInfoService } from './manufactured-materials-info.service';

describe('ManufacturedMaterialsInfoService', () => {
  let service: ManufacturedMaterialsInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturedMaterialsInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
