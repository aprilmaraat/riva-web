import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericService } from './generic.service';
import { map } from 'rxjs/operators';
import { Login } from '../models/login';
import { AuthResponse } from '../models/auth.response';
import { environment } from './../../environments/environment';

@Injectable()
export class AuthService extends GenericService {
  baseUrl = environment.apiUrl + 'login';
  
  private currentUserSubject: BehaviorSubject<AuthResponse>;
  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public http: HttpClient) {
    super(http);
    this.currentUserSubject = new BehaviorSubject<AuthResponse>(JSON.parse(localStorage.getItem('currentUser')));

    if (this.currentUserSubject.value != null) {
      let user = new Login();
      user.userName = this.currentUserSubject.value.userName;
      user.loginId = 0;

      this.setSPID(user).subscribe(res => { res }, err => { console.log("this.setSPID",  err) });
    }


  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public loginUser(login: Login) {
    return this.post(login, '').pipe(map(response => {
      this.setUserCache(response);
      return response;
    }));
  }

  public logout() {
    localStorage.removeItem('currentUser');
    this.loggedIn.next(false);
    this.currentUserSubject.next(null);
  }

  public registerUser(login: Login) {
    return this.post(login, '/register');
  }

  private setUserCache(authResponse: AuthResponse) {
    localStorage.setItem('currentUser', JSON.stringify(authResponse));
    this.loggedIn.next(true);
    this.currentUserSubject.next(authResponse);
  }

  public setSPID(login: Login) {
    return this.put(login, '/setspid');
  }
}
