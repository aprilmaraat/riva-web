import { TestBed } from '@angular/core/testing';

import { FindingsinfoService } from './findingsinfo.service';

describe('FindingsinfoService', () => {
  let service: FindingsinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindingsinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
