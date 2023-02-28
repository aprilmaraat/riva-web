import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Rawmaterialsinfo } from './../models/raw-materials.model';

@Injectable({
  providedIn: 'root'
})
export class RawmaterialsinfoService extends GenericService {
  baseUrl = environment.apiUrl + 'rawmaterialsinfo';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(rawmaterialsinfo: Rawmaterialsinfo): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', rawmaterialsinfo, { headers: this.headers });
  }


}
