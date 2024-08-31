export class UpdateUserDTO {
  fullname: string;
  phone_number: string;
  password: string;
  retype_password: string;

  constructor(data: any) {
    this.fullname = data.fullname;
    this.phone_number = data.phone_number;
    this.password = data.password;
    this.retype_password = data.retype_password;
  }
}
