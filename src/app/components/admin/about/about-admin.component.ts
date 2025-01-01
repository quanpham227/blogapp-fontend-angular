import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AboutService } from '../../../services/about.service';
import { About } from '../../../models/about';
import { ApiResponse } from '../../../models/response';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Status } from '../../../enums/status.enum';

@Component({
  selector: 'app-about-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './about-admin.component.html',
  styleUrls: ['./about-admin.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))]),
    ]),
  ],
})
export class AboutAdminComponent implements OnInit {
  businessForm: FormGroup;
  about: About = {} as About;
  isEditMode = false;
  isLoading = false;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private aboutService: AboutService) {
    this.businessForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      content: ['', Validators.maxLength(10000)],
      imageUrl: ['', Validators.maxLength(2048)],
      address: ['', Validators.maxLength(255)],
      phoneNumber: ['', Validators.maxLength(50)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      workingHours: ['', Validators.maxLength(255)],
      facebookLink: ['', Validators.maxLength(255)],
      youtube: ['', Validators.maxLength(255)],
      visionStatement: ['', Validators.maxLength(10000)],
      foundingDate: ['', Validators.maxLength(100)],
      ceoName: ['', Validators.maxLength(50)],
    });
  }

  ngOnInit(): void {
    this.loadAbout();
  }

  loadAbout(): void {
    this.aboutService.getAbout().subscribe({
      next: (data: ApiResponse<About>) => {
        if (data.status === 'OK') {
          if (data.data) {
            this.about = data.data;
            this.businessForm.patchValue(this.about);
          }
        } else {
          console.error('Failed to load about information:', data.message);
        }
      },
      error: (error) => {
        console.error('Error loading about information:', error);
      },
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode && this.businessForm.dirty) {
      if (!confirm('You have unsaved changes. Do you really want to cancel?')) {
        return;
      }
    }
    this.isEditMode = !this.isEditMode;
  }

  onSubmit(): void {
    if (this.businessForm.invalid) {
      return;
    }
    this.isLoading = true;
    const updatedAbout = this.businessForm.value;
    this.aboutService.updateAbout(this.about.id, updatedAbout).subscribe({
      next: (response: ApiResponse<About>) => {
        if (response.status === Status.OK) {
          if (response.data) {
            this.about = response.data;
            this.businessForm.patchValue(this.about);
          }
        }
        this.isLoading = false;
        this.toggleEditMode();
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }
}
