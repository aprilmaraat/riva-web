import { Component, OnInit } from '@angular/core';
import { LoadService } from 'src/app/custom/load-overlay/load-overlay.service';
import { AccountService } from 'src/app/services/account.service';
import { Login } from 'src/app/models/login';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GenericComponent } from '../generic/generic.component';
import { AlertService } from 'src/app/custom/_alert';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LoginRoles, LoginRoleTypes } from 'src/app/models/login-roles.model';
import { Logistics, Items, PD, Report_and_tools, Admin_Pages } from 'src/app/models/constant/pages.const';

@Component({
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.scss']
})
export class AccountsTableComponent extends GenericComponent implements OnInit {
  logins: Login[];
  newLogins: Login[] = [];
  oldPassword: string = '';
  selectedLogin: Login;
  tabIndex = 0;

  permissionType = ['Read', 'Write'];

  logistics = Logistics;
  itemsPages = Items;
  pdPages = PD;
  reportsToolsPages = Report_and_tools;
  adminPages = Admin_Pages;

  constructor(authService: AuthService
    , loadService: LoadService
    , alertService: AlertService
    , private accountService: AccountService
    , private router: Router
    , private modalService: NgbModal) {
    super(authService, loadService, alertService);
    this.loadService.load(false);
    // this.loadService.loadContent(true);
  }

  ngOnInit(): void {
    this.loadTable();
    this.setPagePermission('Accounts');
  }

  roleTypes: LoginRoleTypes[] = [];

  loadTable(selectLastIndex: boolean = false, loginId?: number){
    this.accountService.getRoleTypes().subscribe(response => {
      this.roleTypes = response;
    });
    this.accountService.getList().subscribe(response => {
      this.logins = response;
      this.selectLogin(this.logins[0]);
      if(selectLastIndex){
        this.selectLogin(this.logins[this.logins.length - 1]);
      }
      if(loginId != undefined || loginId != null){
        this.selectLogin(this.logins.find(x => x.loginId == loginId));
      }
      this.loadService.loadContent(false);
    }, error => {
        this.alertService.error('Account Table: API error.');
        this.loadService.loadContent(false);
    });
  }

  role: LoginRoles = new LoginRoles();
  restrictions = [];

  selectLogin(login: Login){
    this.selectedLogin = login;
    this.role = new LoginRoles();
    this.getRole(this.selectedLogin.loginId);
  }

  getRole(id: number){
    this.accountService.getRole(id).subscribe(result => {
      this.role = result;
      if(this.role.restrictions != null && this.role.restrictions != undefined && this.role.restrictions != ''){
        this.restrictions = JSON.parse(this.role.restrictions);
      }
    });
  }

  newRow(){
    let newLogin = new Login;
    newLogin.loginId = 0;
    newLogin.userName = '';
    newLogin.password = '';
    this.newLogins.push(newLogin);
  }

  newLogin: Login = new Login();

  save(login: Login){
    if(login.loginId !== 0){
      this.accountService.updateLoginDetails(login).subscribe(response => {
        this.loadTable();
      }, error => {
        this.alertService.error(error);
      });
    }
    else{
      if(!this.checkStringIfEmpty(login.userName) && !this.checkStringIfEmpty(login.password))
      {
        this.authService.registerUser(login).subscribe(response => {
          this.tabIndex = 1;
          this.loadTable(true);
          this.newLogin = new Login();
          this.alertService.success('Account saved.');
        }, error => {
          this.alertService.error('Error saving new account.');
        });
      }
    }
  }

  updateRole(){
    if(this.isAuthorized){
      this.loadService.loadContent(true);
      this.role.restrictions = JSON.stringify(this.restrictions);
      this.accountService.updateRole(this.role).subscribe(response => {
        this.alertService.success('Successfully updated role.');
        this.loadTable(false, this.selectedLogin.loginId);
        this.loadService.loadContent(false);
      }, error => {
        console.error(error);
        this.alertService.error('Error updating role');
        this.loadService.loadContent(false);
      });
    }
    else{
      this.pagePermissionError();
    }
    
  }

  get isNewLoginEmpty(){
    return (this.checkStringIfEmpty(this.newLogin.userName) || this.checkStringIfEmpty(this.newLogin.password));
  }

  storeOldPassword(login: Login){
    this.oldPassword = login.password;
  }

  updateLoginPassword(login: Login): string{
    if(!this.checkStringIfEmpty(login.password)){
      let update = new Login();
      update.loginId = login.loginId;
      update.password = login.password;
      this.accountService.updateLoginDetails(update).subscribe(response => {
        // this.loadTable();
      }, error => {
        this.alertService.error(error);
      });
    }
    else{
      return this.oldPassword;
    }
  }

  updateUsername(login: Login){
    let update = new Login();
    update.loginId = login.loginId;
    update.userName = login.userName;
    this.accountService.updateLoginDetails(update).subscribe(response => {
      // this.loadTable();
    }, error => {
      this.alertService.error(error);
    });
  }

  updateFirstName(login: Login){
    let update = new Login();
    update.loginId = login.loginId;
    update.firstName = login.firstName;
    this.accountService.updateLoginDetails(update).subscribe(response => {
      // this.loadTable();
    }, error => {
      this.alertService.error(error);
    });
  }

  updateLastName(login: Login){
    let update = new Login();
    update.loginId = login.loginId;
    update.lastName = login.lastName;
    this.accountService.updateLoginDetails(update).subscribe(response => {
      // this.loadTable();
    }, error => {
      this.alertService.error(error);
    });
  }

  updateEmployeeID(login: Login){
    let update = new Login();
    update.loginId = login.loginId;
    update.employeeId = login.employeeId;
    this.accountService.updateLoginDetails(update).subscribe(response => {
      // this.loadTable();
    }, error => {
      this.alertService.error(error);
    });
  }

  deleteLogin(id: number){
    if(this.isAuthorized){
      this.accountService.deleteLogin(id).subscribe(response => {
        this.loadTable();
        this.router.navigate(['/accounts']);
      }, error => {
        this.alertService.error(error);
      });
    }
    else{
      this.pagePermissionError();
    }
  }

  deleteNewLogin(id: number){
    this.newLogins = this.newLogins.filter(n => n.loginId !== id);
  }

  closeResult = '';

  modalOpen(content) {
    if(this.isAuthorized){
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
  
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
    else{
      this.pagePermissionError();
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}
