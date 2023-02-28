import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Login } from 'src/app/models/login';
import { GenericComponent } from '../generic/generic.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';


@Component({
  selector: 'riva-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends GenericComponent implements OnInit {
  public login = new Login;
  public error = { UserName: false, Password: false };
  public returnUrl: string;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private route: ActivatedRoute
    , private router: Router) {
    super(authService, loadService, alertService);
    if (authService.currentUserValue) {
      this.router.navigate(['/main/products']);
    }
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main/products';
  }

  loginUser() {
    if (!this.checkStringIfEmpty(this.login.userName) && !this.checkStringIfEmpty(this.login.password)) {
      this.loadService.load(true);
      this.error.UserName = false;
      this.error.Password = false;

      this.authService.loginUser(this.login).subscribe(response => {
        if (this.authService.currentUserValue) {
          this.loadService.load(false);
          this.router.navigate([this.returnUrl]);
        }
      }, error => {
        this.alertService.error(error.error);
        this.loadService.load(false);
      });
      
    }
    else {
      this.error.UserName = this.checkStringIfEmpty(this.login.userName);
      this.error.Password = this.checkStringIfEmpty(this.login.password);
      this.alertService.error('All fields are required, please check for errors.');
    }
  }

}
