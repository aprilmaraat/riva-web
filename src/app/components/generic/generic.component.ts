import { AuthService } from 'src/app/services/auth.service';
import { LoadService } from '../../custom/load-overlay/load-overlay.service';
import { AlertService } from 'src/app/custom/_alert';
import { BomItemType } from 'src/app/models/enum/bom-item-type.enum';
import { Restriction } from 'src/app/models/restriction';

export abstract class GenericComponent{
  searchString = '';
  public editMode: boolean = false;
  autosaveCounter: number = 0;
  showAutosaveCounter: boolean = false;
  isAuthorized: boolean = false; // for read/write page permission

  constructor(public authService: AuthService
    , public loadService: LoadService
    , public alertService: AlertService) { 
      this.checkCache();
    }

  get loggedUser(): string {
    if (this.authService.currentUserValue)
      return this.authService.currentUserValue.userName;
  }

  get userRole(){
    if (this.authService.currentUserValue){
      return this.authService.currentUserValue.permissions;
    }
    return null;
  }

  setPagePermission(page: string){
    if (this.authService.currentUserValue){
      if(this.authService.currentUserValue.permissions.roleType == 1){
        this.isAuthorized = true;
      }
      else{
        let permission: Restriction[] = JSON.parse(this.authService.currentUserValue.permissions.restrictions);
        let accessType = permission.find(x => x.Page == page);
        this.isAuthorized = accessType.Permission == 'Write'; 
      }
    }
    else{
      this.isAuthorized = false;
    }
  }

  pagePermissionError(){
    this.alertService.error('Error: Action is unauthorized for this user.');
  }

  checkStringIfEmpty(value: string): boolean {
    return (value === undefined) || (value === '');
  }

  checkCache(){

    if (this.authService.currentUserValue)
    {
      let expirationDT = new Date(this.authService.currentUserValue.expiration);
      let currentDT = new Date();
      if(currentDT.getTime() >= expirationDT.getTime()){    
        this.authService.loggedIn.next(false);
        this.authService.logout();
      }
      else{
        this.authService.loggedIn.next(true);
      }
    }
    
  }

  rowColor(itemType: number)
  {
    if(itemType == BomItemType.Subassemblies){
      return 'row-item-sa';
    }
    else if(itemType == BomItemType.Chain){
      return 'row-item-chain';
    }
    else if(itemType == BomItemType.Enamel){
      return 'row-item-enamel';
    }
    else if(itemType == BomItemType.Findings){
      return 'row-item-finding';
    }
    else if(itemType == BomItemType.Gems){
      return 'row-item-gem';
    }
    else if(itemType == BomItemType.ManufacturedMats){
      return 'row-item-mm';
    }
    else if(itemType == BomItemType.MetalGrains){
      return 'row-item-mg';
    }
    else if(itemType == BomItemType.Nonprecious){
      return 'row-item-np';
    }
  }

}

export class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}