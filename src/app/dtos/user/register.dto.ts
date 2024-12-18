import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  retypePassword: string;

  facebookAccountId: string = '';

  googleAccountId: string = '';

  @IsString()
  roleId: number = 2;

  constructor(data: any) {
    this.fullName = data.fullname;
    this.phoneNumber = data.phone_number;
    this.email = data.email;
    this.password = data.password;
    this.retypePassword = data.retype_password;
    this.facebookAccountId = data.facebook_account_id || '';
    this.googleAccountId = data.google_account_id || '';
    this.roleId = data.role_id || 2;
  }
}
