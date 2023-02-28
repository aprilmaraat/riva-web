import { TestBed } from '@angular/core/testing';

import { ProductsRoutingService } from './products-routing.service';

describe('ProductsRoutingService', () => {
  let service: ProductsRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsRoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
