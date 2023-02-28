import { TestBed } from '@angular/core/testing';

import { ProductStoreInfoService } from './product-store-info.service';

describe('ProductStoreInfoService', () => {
  let service: ProductStoreInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductStoreInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
