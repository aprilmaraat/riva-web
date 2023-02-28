import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class MetalGrainService extends GenericService{
  baseUrl = environment.apiUrl + 'metalgrain';

  constructor(http: HttpClient) {
    super(http);
  }

  // uploadTempPhoto(object: FormData): Observable<any>{
  //   return this.http.post(this.baseUrl + '/upload-temp', object, {reportProgress: true, observe: 'events'});
  // }

  // moveTemp(id: number, fileID: string): Observable<any>{
  //   return this.http.get(this.baseUrl + '/move-temp/'+id+'/'+fileID, { headers: this.headers });
  // }

}
