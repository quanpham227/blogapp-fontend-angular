import { UserService } from './../../services/user.service';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterDTO } from '../../dtos/user/register.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class RegisterComponent implements OnDestroy {
  @ViewChild('registerForm') registerForm!: NgForm;
  // khai báo các biến tương ứng với các trường trong form đăng ký
  fullName: string;
  phone_number: string;
  email: string;
  password: string;
  retypePassword: string;
  isAccepted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService,
  ) {
    this.fullName = '';
    this.phone_number = '';
    this.email = '';
    this.password = '';
    this.retypePassword = '';
    this.isAccepted = false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onEmailChange() {
    console.log('Email:', this.email);
  }
  register() {
    const registerDTO: RegisterDTO = {
      fullname: this.fullName,
      phone_number: this.phone_number,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
      facebook_account_id: '',
      google_account_id: '',
      role_id: 2,
    };
    const registerSub = this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        debugger;
        this.router.navigate(['/login']);
      },

      error: (error) => {
        debugger;
        alert(`Can't register, error: ${error.error.message}`);
      },
    });
    this.subscriptions.add(registerSub);
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
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
