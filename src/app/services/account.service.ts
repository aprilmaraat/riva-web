import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Login } from '../models/login';
import { environment } from './../../environments/environment';
import { LoginRoles } from '../models/login-roles.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService extends GenericService{
  baseUrl = environment.apiUrl + 'login';

  constructor(public http: HttpClient){
    super(http);
  }

  getAccountDetails(id: number){
    return this.get(id, '');
  }

  updateLoginDetails(login: Login){
    return this.put(login, '');
  }

  deleteLogin(id: number){
    return this.delete(id, '');
  }

  getRole(id: number){
    return this.http.get<any>(this.baseUrl + '/' + id + '/role', { headers: this.headers });
  }

  getRoleTypes(){
    return this.http.get<any>(this.baseUrl + '/roletypes', { headers: this.headers });
  }

  updateRole(loginRole: LoginRoles){
    return this.http.put(this.baseUrl + '/role', loginRole, { headers: this.headers });
  }

}
