import { TestBed } from '@angular/core/testing';

import { ProductBomService } from './product-bom.service';

describe('ProductBomService', () => {
  let service: ProductBomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductBomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
