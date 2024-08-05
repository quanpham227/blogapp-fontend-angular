import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;
  // khai báo các biến tương ứng với các trường trong form đăng ký
  phone: string;
  password: string;
  retypePassword: string;
  fullName: string;
  isAccepted: boolean;

  constructor(private http: HttpClient, private router: Router) {
    this.phone = '6786786789';
    this.password = '6786786789';
    this.retypePassword = '6786786789';
    this.fullName = 'Angular';
    this.isAccepted = true;
    //jnject HttpClient và Router vào constructor
  }
  onPhoneChange() {
    console.log('Phone:', this.phone);
  }
  register() {
    const apiUrl = 'http://localhost:9090/api/v1/users/register';

    const registerData = {
      phone_number: this.phone,
      fullname: this.fullName,
      email: '',
      password: this.password,
      retype_password: this.retypePassword,
      facebook_account_id: '',
      google_account_id: '',
      role_id: 2,
    };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.post(apiUrl, registerData, { headers: headers }).subscribe({
      next: (response: any) => {
        debugger;
        this.router.navigate(['/login']);
      },
      complete: () => {
        debugger;
      },
      error: (error: any) => {
        alert(`Cannot register, error: ${error.error}`);
      },
    });
  }
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
