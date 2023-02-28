import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FindingsInfo } from './../models/findings.model';

@Injectable({
  providedIn: 'root'
})
export class FindingsinfoService extends GenericService {

  baseUrl = environment.apiUrl + 'findingsinfo';

  constructor(http: HttpClient) {
    super(http);
  }


  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(findingsinfo: FindingsInfo): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', findingsinfo, { headers: this.headers });
  }

}
