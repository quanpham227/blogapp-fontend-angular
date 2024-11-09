import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.admin.component.html',
  styleUrl: './forgot-password.admin.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))]),
    ]),
  ],
})
export class ForgotPasswordAdminComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType = '';

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;

      // Simulate API call
      setTimeout(() => {
        if (this.isValidEmailDomain(email)) {
          this.showNotificationMessage('Password reset link has been sent to your email', 'success');
          this.forgotPasswordForm.reset();
        } else {
          this.showNotificationMessage('Email not found in our system', 'error');
        }
        this.isLoading = false;
      }, 1500);
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  private isValidEmailDomain(email: string): boolean {
    // This is a mock validation - replace with actual validation logic
    return email.includes('@');
  }

  private showNotificationMessage(message: string, type: string): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}
