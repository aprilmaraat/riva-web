import { TestBed } from '@angular/core/testing';

import { FindingsService } from './findings.service';

describe('FindingsService', () => {
  let service: FindingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
