import { TestBed } from '@angular/core/testing';

import { InventoryLogService } from './inventory-log.service';

describe('InventoryLogService', () => {
  let service: InventoryLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
