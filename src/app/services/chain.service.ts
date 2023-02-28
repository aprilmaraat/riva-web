import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Chain, ChainLinkSize, ChainType } from './../models/chain.model';

@Injectable({
  providedIn: 'root'
})
export class ChainService extends GenericService {
  baseUrl = environment.apiUrl + 'chain';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(chain: Chain): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', chain, { headers: this.headers });
  }

  getListType(): Observable<any> {
    return this.http.get(this.baseUrl + '/listtype', { headers: this.headers });
  }

  addchaintype(chainType: ChainType): Observable<any> {
    return this.http.post(this.baseUrl + '/addtype', chainType, { headers: this.headers });
  }

  getListLinkSize(): Observable<any> {
    return this.http.get(this.baseUrl + '/listlinksize', { headers: this.headers });
  }

  addlinksize(chainlinksize: ChainLinkSize): Observable<any> {
    return this.http.post(this.baseUrl + '/addlinksize', chainlinksize, { headers: this.headers });
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

  getChain(item: Chain): Observable<any> {
    return this.http.post(this.baseUrl + '/getchain', item, { headers: this.headers });
  }

}
