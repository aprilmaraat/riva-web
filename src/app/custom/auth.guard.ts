import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Logistics, Items, PD, Report_and_tools, Admin_Pages } from '../models/constant/pages.const';
import { Restriction } from '../models/restriction';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    logistics = Logistics;
    itemsPages = Items;
    pdPages = PD;
    reportsToolsPages = Report_and_tools;
    adminPages = Admin_Pages;

    constructor(
        private router: Router, 
        private authenticationService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
          let restrictions: Restriction[] = JSON.parse(currentUser.permissions.restrictions);

            let logistics = this.logistics.find(x => state.url.includes(x.url));
            let itemsPages = this.itemsPages.find(x => state.url.includes(x.url));
            let pdPages = this.pdPages.find(x => state.url.includes(x.url));
            let reportsToolsPages = this.reportsToolsPages.find(x => state.url.includes(x.url));
            let adminPages = this.adminPages.find(x => state.url.includes(x.url));

            if(currentUser.permissions.roleType == 1) return true;
            else{
              if (logistics != undefined){
                if (restrictions.find(x => x.Page == logistics.name).Permission != 'Disabled'){
                        return true;
                    }
                }

              if (itemsPages != undefined){
                if (restrictions.find(x => x.Page == itemsPages.name).Permission != 'Disabled'){
                        return true;
                    }
                }
    
              if (pdPages != undefined){
 
                if (restrictions.find(x => x.Page == pdPages.name).Permission != 'Disabled'){
                        return true;
                    }
                }
    
              if (reportsToolsPages != undefined){
                if (restrictions.find(x => x.Page == reportsToolsPages.name).Permission != 'Disabled'){
                        return true;
                    }
              }

              if (adminPages != undefined) {
                if (restrictions.find(x => x.Page == adminPages.name).Permission != 'Disabled') {
                  return true;
                }
              }

                this.router.navigate(['/forbidden']);
            }
            
        }
        else{
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
    }
}
