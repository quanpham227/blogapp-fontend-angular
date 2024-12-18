import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-admin',
  templateUrl: './contact.admin.component.html',
  styleUrls: ['./contact.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class ContactAdminComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        console.log(this.contactForm.value);
        this.isSubmitting = false;
        this.contactForm.reset();
      }, 2000);
    }
  }
}
