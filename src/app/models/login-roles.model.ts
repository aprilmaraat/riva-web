import { Login } from "./login";

export class LoginRoles{
    id: number = 0;
    loginId: number = 0;
    roleType: number = 1;
    restrictions: string = '';
    roleTypeNavigation: LoginRoleTypes = new LoginRoleTypes();
}

export class LoginRoleTypes{
    id: number = 0;
    name : string = '';
}