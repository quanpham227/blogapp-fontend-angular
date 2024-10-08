import { UserResponse } from './../../responses/user/user.response';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LoginDTO } from '../../dtos/user/login.dto';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../responses/user/login.response';
import { TokenService } from '../../services/token.service';
import { RoleService } from '../../services/role.service'; // Import RoleService
import { Role } from '../../models/role'; // Đường dẫn đến model Role
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  @ViewChild('loginForm') loginForm!: NgForm;
  //User
  // email: string = 'quanpham@poongin.co.kr';
  // password: string = '123456';

  //Admin+

  email: string = 'quan@poongin.co.kr';
  password: string = '123456';

  roles: Role[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse;
  passwordVisible: boolean = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService, // Inject Role
  ) {}

  //Khi page được load
  ngOnInit() {
    // Gọi API lấy danh sách roles và lưu vào biến roles
    debugger;
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        // Sử dụng kiểu Role[]
        debugger;
        this.roles = roles;
        this.selectedRole = roles.length > 0 ? roles[0] : undefined;
      },
      error: (error: any) => {
        debugger;
        console.error('Error getting roles:', error);
      },
    });
  }

  onEmailChange(event: Event) {
    const inputEmail = event.target as HTMLInputElement;
    this.email = inputEmail.value;
  }
  onPasswordChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.password = inputElement.value;
  }
  login() {
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
      role_id: this.selectedRole?.id ?? 1,
    };

    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        if (this.rememberMe) {
          this.userService.getUserDetail(response.data.token).subscribe({
            next: (response: any) => {
              console.log('User details received:', response);
              this.userResponse = response.data;
              this.userService.saveToLocalStorage(this.userResponse);

              if (this.userResponse?.role.name === 'ADMIN') {
                this.router.navigate(['/admin/dashboard']);
              } else if (this.userResponse?.role.name === 'USER') {
                this.router.navigate(['/']);
              }
            },
            complete: () => {},
            error: (error: any) => {
              console.error('Error getting user details:', error);
              alert(error.error.message);
            },
          });
        } else {
          console.log('Remember Me is false or token is not present.');
        }
      },

      complete: () => {},
      error: (error: any) => {
        console.error('Error logging in:', error);
        alert(error.error.message);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible; // Đảo ngược trạng thái hiển thị mật khẩu
  }
}
