import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService extends GenericService{

  baseUrl = environment.apiUrl + 'work-order';

  constructor(http: HttpClient) {
    super(http);
  }

  public getListReport(): Observable<any>{
    return this.http.get<any>(this.baseUrl + '/list-report', { headers: this.headers });
  }

  public closeWorkOrder(wkoId: number): Observable<any>{
    return this.http.put<any>(this.baseUrl + '/close-wko/' + wkoId, { headers: this.headers });
  }

  public closeWorkOrderDetail(wkoDetailId: number): Observable<any>{
    return this.http.put<any>(this.baseUrl + '/close-wko-detail/' + wkoDetailId, { headers: this.headers });
  }
}
