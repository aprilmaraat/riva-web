import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends GenericService{
  baseUrl = environment.apiUrl + 'suppliers';

  constructor(http: HttpClient) {
    super(http);
  }
}
