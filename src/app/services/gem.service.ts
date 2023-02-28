import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Gems, GemInventory, GemSizes } from './../models/gems.model';

@Injectable({
  providedIn: 'root'
})
export class GemService extends GenericService{
  baseUrl = environment.apiUrl + 'gems';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  getCutList(): Observable<any> {
    return this.http.get(this.baseUrl + '/cutlist', { headers: this.headers });
  }

  getGemItemName(inventoryId: number): Observable<any> {
    let url = this.baseUrl + "/gem-item-name/" + inventoryId;
    return this.http.get(url, { headers: this.headers });
  }

  update(gem : Gems): Observable<any> {
    return this.http.post(this.baseUrl + '/update', gem, { headers: this.headers });
  }

  getProductImages(id: number): Observable<any> {
    return this.http.get(this.baseUrl + '/upload/' + id + '/list', { headers: this.headers });
  }

  uploadImage(object: FormData): Observable<any> {
    return this.http.post(this.baseUrl + '/upload', object, { reportProgress: true, observe: 'events' });
  }

  getTypeList(): Observable<any> {
    return this.http.get(this.baseUrl + '/typelist', { headers: this.headers });
  }

  getSizeList(): Observable<any> {
    return this.http.get(this.baseUrl + '/sizelist', { headers: this.headers });
  }

  getGemInventory(item: GemInventory): Observable<any> {
    return this.http.post(this.baseUrl + '/getinventory', item,  { headers: this.headers });
  }

  addupdate(item: GemInventory): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', item, { headers: this.headers });
  }

  addupdateSize(item: GemSizes): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdatesize', item, { headers: this.headers });
  }

}
