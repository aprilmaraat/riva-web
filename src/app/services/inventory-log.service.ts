import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { InventoryLog } from '../models/inventory-log';

@Injectable({
  providedIn: 'root'
})
export class InventoryLogService extends GenericService{
  baseUrl = environment.apiUrl + 'inventorylog';

  constructor(http: HttpClient) {
    super(http);
  }

  // generateWorkOrder(orderId: number){
  //   return this.http.get<any>(this.baseUrl + '/workorder-report/' + orderId, { headers: this.headers });
  // }

  // generateProductInventory(){
  //   return this.http.get<any>(this.baseUrl + '/productinventory-report', { headers: this.headers });
  // }

  getScannerData(barcodeId: number){
    return this.get(barcodeId, '/GetScannerData');
  }

  //getScannerDataItemNo(itemNo: string){
  //  return this.getParamString(itemNo, '/GetScannerDataItemNo');
  //}

  getScannerDataItemNo(object: InventoryLog) {
    return this.post(object, '/GetScannerDataItemNo');
  }

  getScannerDataWKO(wkoID: string) {
    return this.getParamString(wkoID, '/GetScannerDataWKO');
  }

  addInventoryLog(object: InventoryLog){
    return this.put(object, '/update');
  }
}
