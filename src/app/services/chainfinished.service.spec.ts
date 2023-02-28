import { TestBed } from '@angular/core/testing';

import { ChainfinishedService } from './chainfinished.service';

describe('ChainfinishedService', () => {
  let service: ChainfinishedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChainfinishedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
