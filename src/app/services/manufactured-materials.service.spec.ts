import { TestBed } from '@angular/core/testing';

import { ManufacturedMaterialsService } from './manufactured-materials.service';

describe('ManufacturedMaterialsService', () => {
  let service: ManufacturedMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturedMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
