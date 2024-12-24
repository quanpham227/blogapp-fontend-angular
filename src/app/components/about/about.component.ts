import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements OnInit {
  about: About = {} as About;
  businessForm: FormGroup;
  isLoading = true;
  isEditMode = false;

  constructor(
    private aboutService: AboutService,
    private fb: FormBuilder,
  ) {
    this.businessForm = this.fb.group({
      id: [''],
      title: [''],
      content: [''],
      imageUrl: [''],
      address: [''],
      phoneNumber: [''],
      email: [''],
      workingHours: [''],
      facebookLink: [''],
      youtube: [''],
      visionStatement: [''],
      foundingDate: [''],
      ceoName: [''],
    });
  }

  ngOnInit() {
    this.getAbout();
  }

  getAbout() {
    this.aboutService
      .getAbout()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.about = response.data;
            this.businessForm.patchValue(this.about);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  onSubmit() {
    if (this.businessForm.valid) {
      this.isLoading = true;
      const updatedAbout = this.businessForm.value;
      this.aboutService
        .updateAbout(updatedAbout.id, updatedAbout)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response: any) => {
            this.about = response.data;
            this.isLoading = false;
            this.isEditMode = false;
          },
          error: (error: any) => {
            this.isLoading = false;
          },
        });
    }
  }
  handleImageError(event: any): void {
    event.target.src = 'https://res.cloudinary.com/damphlbsi/image/upload/v1734612634/blogapp/about/cnjhofjhgykqgxkfbgdn.jpg';
  }
}
