export class UpdateUserDTO {
  fullName: string;
  phoneNumber: string;
  password: string;
  retypePassword: string;

  constructor(data: any) {
    this.fullName = data.fullName;
    this.phoneNumber = data.phoneNumber;
    this.password = data.password;
    this.retypePassword = data.retypePassword;
  }
}
