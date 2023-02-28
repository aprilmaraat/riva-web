import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class EnamelService extends GenericService{
  baseUrl = environment.apiUrl + 'enamel';

  constructor(http: HttpClient) {
    super(http);
  }
}
