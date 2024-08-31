import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  retype_password: string;

  facebook_account_id: string = '';

  google_account_id: string = '';

  @IsString()
  role_id: number = 2;

  constructor(data: any) {
    this.fullname = data.fullname;
    this.phone_number = data.phone_number;
    this.email = data.email;
    this.password = data.password;
    this.retype_password = data.retype_password;
    this.facebook_account_id = data.facebook_account_id || '';
    this.google_account_id = data.google_account_id || '';
    this.role_id = data.role_id || 2;
  }
}
