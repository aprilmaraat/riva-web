import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RawMaterials } from './../models/raw-materials.model';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialsService extends GenericService {
  baseUrl = environment.apiUrl + 'rawmaterials';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(rawmaterials: RawMaterials): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', rawmaterials, { headers: this.headers });
  }

  delete(rawmaterialsId: number): Observable<any> {
    return this.http.post(this.baseUrl + '/delete/'  + rawmaterialsId , { headers: this.headers });
  }

  uploadImage(object: FormData): Observable<any> {
    return this.http.post(this.baseUrl + '/upload', object, { reportProgress: true, observe: 'events' });
  }

  lastupdate(id : number): Observable<any> {
    return this.http.get(this.baseUrl + '/lastupdate/' + id.toString(), { headers: this.headers });
  }

}
