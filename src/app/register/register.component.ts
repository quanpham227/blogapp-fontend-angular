import { UserService } from './../services/user.service';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterDto } from 'src/app/dtos/register.dto';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;
  // khai báo các biến tương ứng với các trường trong form đăng ký
  fullName: string;
  phone: string;
  email: string;
  password: string;
  retypePassword: string;
  isAccepted: boolean;

  constructor(private router: Router, private useService: UserService) {
    this.fullName = '';
    this.phone = '';
    this.email = '';
    this.password = '';
    this.retypePassword = '';
    this.isAccepted = true;
    //jnject HttpClient và Router vào constructor
  }
  onPhoneChange() {
    console.log('Phone:', this.phone);
  }
  register() {
    const registerDTO: RegisterDto = {
      fullname: this.fullName,
      phone_number: this.phone,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
      facebook_account_id: '',
      google_account_id: '',
      role_id: 2,
    };
    this.useService.register(registerDTO).subscribe({
      next: (response: any) => {
        debugger;
        this.router.navigate(['/login']);
      },
      complete: () => {
        debugger;
      },
      error: (error) => {
        debugger;
        alert(`Can't register, error: ${error.error.message}`);
      },
    });
  }

  //how to check if the password and retype password are the same
  checkPasswordsMatch() {
    if (this.password !== this.retypePassword) {
      this.registerForm.controls['retypePassword'].setErrors({
        passwordMismatch: true,
      });
    } else {
      this.registerForm.controls['retypePassword'].setErrors(null);
    }
  }
}
