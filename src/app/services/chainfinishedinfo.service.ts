import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChainfinishedInfo } from './../models/chainfinished.model';

@Injectable({
  providedIn: 'root'
})
export class ChainfinishedinfoService extends GenericService{
  baseUrl = environment.apiUrl + 'chainfinishedinfo';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(chainfinishedinfo: ChainfinishedInfo): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', chainfinishedinfo, { headers: this.headers });
  }

  delete(findingsID: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + findingsID, { headers: this.headers });
  }

  uploadImage(object: FormData): Observable<any> {
    return this.http.post(this.baseUrl + '/upload', object, { reportProgress: true, observe: 'events' });
  }

  lastupdate(id: number): Observable<any> {
    return this.http.get(this.baseUrl + '/lastupdate/' + id.toString(), { headers: this.headers });
  }

}
