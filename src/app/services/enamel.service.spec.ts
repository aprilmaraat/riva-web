import { TestBed } from '@angular/core/testing';

import { EnamelService } from './enamel.service';

describe('EnamelService', () => {
  let service: EnamelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnamelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
