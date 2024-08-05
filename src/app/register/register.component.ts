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
    const message = `
      phone: ${this.phone},
      password: ${this.password},
      retypePassword: ${this.retypePassword},
      fullName: ${this.fullName}`;
    const apiUrl = 'http://localhost:9090/api/v1/users/register';

    const registerData = {
      phone: this.phone,
      fullname: this.fullName,
      password: this.password,
      retypePassword: this.retypePassword,
      facebook_account_id: '',
      google_account_id: '',
      role_id: 2,
    };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.http.post(apiUrl, registerData, { headers: headers }).subscribe({
      next: (response: any) => {
        debugger;
        // xử lý kết quả trả về khi đăng ký thành công
        if ((response && response.status === 200) || response.status === 201) {
          this.router.navigate(['/login']);
        } else {
          //xử lý kết quả trả về khi đăng ký thất bại
        }
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
