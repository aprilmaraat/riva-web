import { TestBed } from '@angular/core/testing';

import { ChainfinishedinfoService } from './chainfinishedinfo.service';

describe('ChainfinishedinfoService', () => {
  let service: ChainfinishedinfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChainfinishedinfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
