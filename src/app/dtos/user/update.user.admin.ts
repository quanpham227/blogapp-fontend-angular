import { Role } from '../../models/role';

export class UpdateUserByAdminDTO {
  fullName: string;
  phoneNumber: string;
  roleId: number;
  password: string;
  retypePassword: string;

  constructor(data: any) {
    this.fullName = data.fullName;
    this.phoneNumber = data.phoneNumber;
    this.roleId = data.roleId;
    this.password = data.password;
    this.retypePassword = data.retypePassword;
  }
}
