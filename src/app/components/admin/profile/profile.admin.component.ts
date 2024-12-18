import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../../../responses/user/user.response';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-admin',
  templateUrl: './profile.admin.component.html',
  styleUrls: ['./profile.admin.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProfileAdminComponent implements OnInit {
  userData: UserResponse | null = null;
  error: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userData = this.authService.getUser();
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/user-profile-default.jpeg';
  }
}
