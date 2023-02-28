import { Component, Input, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { LoadService } from '../load-overlay/load-overlay.service';
import { Logistics, Items, PD, Report_and_tools, Admin_Pages } from '../../models/constant/pages.const';

import { Observable } from 'rxjs';


@Component({
  selector: 'riva-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent{
  logistics = Logistics;
  itemsPages = Items;
  pdPages = PD;
  reportsToolsPages = Report_and_tools;
  adminPages = Admin_Pages;

  isLoggedIn$: Observable<boolean>;
  showSideNav = true;

  constructor(private authService: AuthService
    , private router: Router
    , private loadService: LoadService) {
      if (authService.currentUserValue) {
        this.authService.loggedIn.next(true);
      }
      this.isLoggedIn$ = this.authService.isLoggedIn;
    }

  get loggedUser(): string {
    if(this.isLoggedIn$)
      return this.authService.currentUserValue.userName;
  }

  ngOnInit(): void {
    this.loadService.load(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
