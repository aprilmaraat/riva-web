import { TestBed } from '@angular/core/testing';

import { MaterialCodeService } from './material-code.service';

describe('MaterialCodeService', () => {
  let service: MaterialCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
