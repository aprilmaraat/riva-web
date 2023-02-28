export class AuthResponse{
  userName: string = "";
  token: string = "";
  expiration: Date = new Date();
  permissions: Permission = new Permission();
}

export class Permission{
  roleType: number = 0;
  restrictions: string = "";
}