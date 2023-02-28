import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class GenericService{
    public baseUrl: string;
    public http: HttpClient;
    public ApiKey:string = environment.apiKey;
    public headers = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-ApiKey',this.ApiKey);

    constructor(_http: HttpClient){
        this.http = _http;
    }

    public get(id: number, endpoint: string): Observable<any>{
        return this.http.get<any>(this.baseUrl + endpoint + '/' + id, { headers: this.headers });
    }

    public getParamString(id: string, endpoint: string): Observable<any>{
        return this.http.get<any>(this.baseUrl + endpoint + '/' + id, { headers: this.headers });
    }

    public getList(): Observable<any>{
        return this.http.get<any>(this.baseUrl + '/list', { headers: this.headers });
    }

    public post(object: any, endpoint: string): Observable<any>{
        return this.http.post(this.baseUrl + endpoint, JSON.stringify(object), { headers: this.headers });
    }

    public put(object: any, endpoint: string): Observable<any> {
        return this.http.put(this.baseUrl + endpoint, JSON.stringify(object), { headers: this.headers });
    }

    public delete(id: number, endpoint: string): Observable<any> {
        return this.http.delete(this.baseUrl + endpoint + '/' + id, { headers: this.headers });
    }

    public uploadTempPhoto(object: FormData): Observable<any>{
        return this.http.post(this.baseUrl + '/upload-temp', object, {reportProgress: true, observe: 'events'});
    }

    public moveTemp(id: number, fileID: string): Observable<any>{
        return this.http.get(this.baseUrl + '/move-temp/'+id+'/'+fileID, { headers: this.headers });
    }

}