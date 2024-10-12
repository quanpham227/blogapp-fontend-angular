import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AboutService } from '../../../services/about.service';
import { About } from '../../../models/about';
import { ApiResponse } from '../../../models/response';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-about-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './about-admin.component.html',
  styleUrls: ['./about-admin.component.scss'],
})
export class AboutAdminComponent implements OnInit {
  aboutForm: FormGroup;
  about: About = {} as About;
  isEditing: { [key: string]: boolean } = {};

  // Định nghĩa các trường và ánh xạ sang tên hiển thị tiếng Việt
  fields: string[] = [
    'title',
    'content',
    'image_url',
    'address',
    'phone_number',
    'email',
    'working_hours',
    'facebook_link',
    'youtube',
    'vision_statement',
    'founding_date',
    'ceo_name',
  ];

  fieldLabels: { [key: string]: string } = {
    title: 'Tiêu đề',
    content: 'Nội dung',
    image_url: 'URL hình ảnh',
    address: 'Địa chỉ',
    phone_number: 'Số điện thoại',
    email: 'Email',
    working_hours: 'Giờ làm việc',
    facebook_link: 'Liên kết Facebook',
    youtube: 'Youtube',
    vision_statement: 'Tuyên bố tầm nhìn',
    founding_date: 'Ngày thành lập',
    ceo_name: 'Tên Giám đốc điều hành',
  };

  constructor(
    private fb: FormBuilder,
    private aboutService: AboutService,
    private toastr: ToastrService,
  ) {
    this.aboutForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      content: [''],
      image_url: ['', Validators.maxLength(2048)],
      address: ['', Validators.maxLength(255)],
      phone_number: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      working_hours: ['', Validators.maxLength(255)],
      facebook_link: ['', Validators.maxLength(255)],
      youtube: ['', Validators.maxLength(255)],
      vision_statement: [''],
      founding_date: ['', Validators.maxLength(100)],
      ceo_name: ['', Validators.maxLength(50)],
    });
  }

  ngOnInit(): void {
    this.loadAbout();
  }

  loadAbout(): void {
    this.aboutService.getAbout().subscribe({
      next: (response: ApiResponse<About>) => {
        if (response.status === 'OK' || response.status === 'ok') {
          this.about = response.data;
          this.aboutForm.patchValue(this.about);
          console.log('About information loaded:', this.about);
        } else {
          console.error('Failed to load about information:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading about information:', error);
      },
    });
  }

  getFieldValue(field: string): any {
    return this.about[field as keyof About];
  }

  editField(field: string): void {
    this.isEditing[field] = true;
  }

  saveField(field: string): void {
    if (this.aboutForm.controls[field].valid) {
      const updatedAbout = {
        ...this.about,
        [field]: this.aboutForm.controls[field].value,
      };
      this.aboutService.updateAbout(this.about.id, updatedAbout).subscribe({
        next: (response: ApiResponse<About>) => {
          if (response.status === 'OK') {
            this.about = response.data;
            this.isEditing[field] = false;

            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          console.error('Error updating about information:', error);
        },
      });
    }
  }

  cancelEdit(field: string): void {
    this.isEditing[field] = false;
    this.aboutForm.controls[field].setValue(this.about[field as keyof About]);
  }

  onSubmit(): void {
    if (this.aboutForm.valid) {
      const updatedAbout = this.aboutForm.value;
      this.aboutService.updateAbout(this.about.id, updatedAbout).subscribe({
        next: (response: ApiResponse<About>) => {
          if (response.status === 'OK') {
            this.about = response.data;
            alert('About information updated successfully');
          } else {
            console.error(
              'Failed to update about information:',
              response.message,
            );
          }
        },
        error: (error) => {
          console.error('Error updating about information:', error);
          console.error('Error status:', error.status); // Thêm dòng này để in ra mã lỗi
          console.error('Error response:', error.error); // Thêm dòng này để xem chi tiết thông điệp lỗi
        },
      });
    }
  }
}
