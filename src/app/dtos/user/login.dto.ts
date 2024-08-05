import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
export class LoginDTO {
  @IsString()
  @IsPhoneNumber('VN')
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(data: any) {
    this.phone_number = data.phone_number;
    this.password = data.password;
  }
}
