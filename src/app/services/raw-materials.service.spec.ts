import { TestBed } from '@angular/core/testing';

import { RawMaterialsService } from './raw-materials.service';

describe('RawMaterialsService', () => {
  let service: RawMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RawMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
