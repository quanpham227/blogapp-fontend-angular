import { Component, ViewChild } from '@angular/core';
import { LoginDTO } from 'src/app/dtos/user/login.dto';
import { UserService } from './../services/user.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;
  phoneNumber: string = '0971999569';
  password: string = '123456';

  constructor(private router: Router, private useService: UserService) {}
  onPhoneNumberChange() {
    console.log('Phone:', this.phoneNumber);
  }
  login() {
    const message = `phone: ${this.phoneNumber}, password: ${this.password}`;
    const loginDTO: LoginDTO = {
      phone_number: this.phoneNumber,
      password: this.password,
    };
    this.useService.login(loginDTO).subscribe({
      next: (response: any) => {
        debugger;
        //this.router.navigate(['']);
      },
      complete: () => {
        debugger;
      },
      error: (error) => {
        debugger;
        alert(`Can't login, error: ${error.error.message}`);
      },
    });
  }
}
