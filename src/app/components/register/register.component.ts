import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';
import { RegisterDTO } from '../../dtos/user/register.dto';
import { passwordMatchValidator } from '../../validators/validators';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../models/response';
import { UserResponse } from '../../responses/user/user.response';
import { Status } from '../../enums/status.enum';

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

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private snackBar: SnackbarService) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator() },
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.snackBar.show('Please fill out all required fields correctly.');
      return;
    }

    this.isLoading = true; // Show loading spinner or indicator
    const registerDTO: RegisterDTO = {
      fullName: this.registerForm.value.fullName,
      phoneNumber: this.registerForm.value.phone,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      retypePassword: this.registerForm.value.confirmPassword,
      facebookAccountId: '',
      googleAccountId: '',
      roleId: 3,
    };

    this.userService
      .register(registerDTO)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<UserResponse>) => {
          if (response.status === Status.CREATED) {
            this.snackBar.show('Registration successful. Please login to continue.');
            this.router.navigate(['/login']);
          } else {
            this.snackBar.show('Registration failed. Please try again.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error); // Log the error for debugging
          // Check if there's an error message in the response
          const errorMessage = error?.error?.message ?? 'An unknown error occurred. Please try again later.';
          this.snackBar.show(errorMessage);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  registerWithGoogle(): void {
    this.snackBar.show('Registering with Google is not yet implemented.');
  }

  registerWithFacebook(): void {
    this.snackBar.show('Registering with Facebook is not yet implemented.');
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
