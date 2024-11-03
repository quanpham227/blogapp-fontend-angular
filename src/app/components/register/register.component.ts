import { UserService } from './../../services/user.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterDTO } from '../../dtos/user/register.dto';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LoggingService } from '../../services/logging.service';
import { SuccessHandlerService } from '../../services/success-handler.service';

@UntilDestroy()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private loggingService: LoggingService,
    private successHandlerService: SuccessHandlerService,
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: this.fb.control('', Validators.required),
        phone: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
        email: this.fb.control('', [Validators.required, Validators.email]),
        password: this.fb.control('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ]),
        confirmPassword: this.fb.control('', Validators.required),
        terms: this.fb.control(false, Validators.requiredTrue),
      },
      { validators: this.passwordMatchValidator() },
    );
  }

  ngOnInit(): void {}

  ngOnDestroy() {}

  passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const registerDTO: RegisterDTO = {
      fullname: this.registerForm.value.fullName,
      phone_number: this.registerForm.value.phone,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      retype_password: this.registerForm.value.confirmPassword,
      facebook_account_id: '',
      google_account_id: '',
      role_id: 2,
    };

    this.userService
      .register(registerDTO)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'OK') {
            this.router.navigate(['/login']);
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
        },
      });
  }

  registerWithGoogle(): void {
    console.log('Register with Google');
  }

  registerWithFacebook(): void {
    console.log('Register with Facebook');
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
