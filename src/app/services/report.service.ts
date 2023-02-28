import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends GenericService {
  baseUrl = environment.apiUrl + 'report';

  constructor(http: HttpClient) {
    super(http);
  }

  generateWorkOrder(orderId: number){
    return this.http.get<any>(this.baseUrl + '/workorder-report/' + orderId, { headers: this.headers });
  }

  generateProductInventory(){
    return this.http.get<any>(this.baseUrl + '/productinventory-report', { headers: this.headers });
  }

}
