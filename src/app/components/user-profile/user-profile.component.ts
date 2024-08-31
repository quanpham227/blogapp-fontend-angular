import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO } from '../../dtos/user/update.user';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class UserProfileComponent implements OnInit {
  userResponse?: UserResponse;
  userProfileForm: FormGroup; // đối tượng FormGroup quản lý dữ liệu của form
  token: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private activatedRoute: ActivatedRoute,
  ) {
    // Tạo FormGroup và các FormControl tương ứng
    this.userProfileForm = this.formBuilder.group(
      {
        fullname: ['', Validators.required], // fullname là FormControl bắt buộc
        phone_number: ['', Validators.minLength(10)], // phone_number là FormControl bắt buộc
        password: ['', Validators.minLength(3)],
        retype_password: ['', Validators.minLength(3)],
      },
      {
        validators: this.passwordMatchValidator, // Thêm validator tự định nghĩa
      },
    );
  }

  ngOnInit(): void {
    debugger;
    this.token = this.tokenService.getToken();
    this.userService.getUserDetail(this.token).subscribe({
      next: (response: any) => {
        debugger;
        this.userResponse = {
          id: response.id,
          fullname: response.fullname,
          email: response.email,
          phone_number: response.phone_number,
          profile_image: response.profile_image,
          is_active: response.is_active,
          facebook_account_id: response.facebook_account_id,
          google_account_id: response.google_account_id,
          role: response.role,
        };
        this.userProfileForm.patchValue({
          fullname: this.userResponse?.fullname ?? '',
          phone_number: this.userResponse?.phone_number ?? '',
        });
        this.userService.saveToLocalStorage(this.userResponse);
      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        console.error(error?.error?.message ?? '');
      },
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const retypedPassword = formGroup.get('retype_password')?.value;
      if (password !== retypedPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  save(): void {
    debugger;
    if (this.userProfileForm.valid) {
      const updateUserDTO: UpdateUserDTO = {
        fullname: this.userProfileForm.get('fullname')?.value,
        phone_number: this.userProfileForm.get('phone_number')?.value,
        password: this.userProfileForm.get('password')?.value,
        retype_password: this.userProfileForm.get('retype_password')?.value,
      };

      this.userService.updateUserDetail(this.token, updateUserDTO).subscribe({
        next: (response: any) => {
          this.userService.removeUserFromLocalStorage();
          this.tokenService.removeToken();
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          debugger;
          console.error(error?.error?.message ?? '');
        },
      });
    } else {
      if (this.userProfileForm.hasError('passwordMismatch')) {
        console.error('Mật khẩu và mật khẩu gõ lại chưa chính xác');
      }
    }
  }
}
