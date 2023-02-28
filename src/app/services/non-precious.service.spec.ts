import { TestBed } from '@angular/core/testing';

import { NonPreciousService } from './non-precious.service';

describe('NonPreciousService', () => {
  let service: NonPreciousService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NonPreciousService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
