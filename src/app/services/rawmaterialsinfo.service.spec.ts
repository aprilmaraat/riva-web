import { TestBed } from '@angular/core/testing';

import { RawmaterialsinfoService } from './rawmaterialsinfo.service';

describe('RawmaterialsinfoService', () => {
  let service: RawmaterialsinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RawmaterialsinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
