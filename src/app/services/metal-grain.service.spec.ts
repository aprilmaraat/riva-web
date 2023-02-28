import { TestBed } from '@angular/core/testing';

import { MetalGrainService } from './metal-grain.service';

describe('MetalGrainService', () => {
  let service: MetalGrainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetalGrainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
