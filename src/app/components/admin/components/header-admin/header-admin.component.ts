import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { UserResponse } from '../../../../responses/user/user.response';
import { UserService } from '../../../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarAdminService } from '../../../../services/sidebar.admin.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss',
})
export class HeaderAdminComponent implements OnInit {
  userResponse?: UserResponse | null;
  activeComponent: string = ''; // Thêm thuộc tính này
  localStorage?: Storage;
  isSidebarVisible: boolean = true;
  isProfileMenuVisible = false;
  isNotificationsVisible = false;
  constructor(
    private userService: UserService,
    private sidebarService: SidebarAdminService,
    private authService: AuthService,
    private router: Router,

    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
  }

  ngOnInit() {
    // Subscribe to the sidebar visibility
    this.sidebarService.isSidebarVisible$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });
    this.checkUserStatus();
  }

  private checkUserStatus() {
    const token = this.authService.getAccessToken();
    if (token && this.authService.isTokenExpired(token)) {
      this.authService.setUser(null);
      this.userResponse = null;
    } else {
      this.userResponse = this.authService.getUser();
    }
  }

  logout() {
    this.userService.logout();
  }
  toggleSidebar() {
    this.sidebarService.toggleSidebarVisibility();
  }
  toggleNotifications() {
    this.isNotificationsVisible = !this.isNotificationsVisible;
  }
  toggleProfileMenu() {
    this.isProfileMenuVisible = !this.isProfileMenuVisible;
  }
  navigateUserProfile() {
    this.router.navigate(['/admin/profile']);
    this.toggleProfileMenu();
  }
  handleImageError(event: any): void {
    event.target.src = 'assets/images/user-profile-default.jpeg';
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.header-admin__profile-menu') || target.closest('.header-admin__nav-link');
    if (!clickedInside) {
      this.isProfileMenuVisible = false;
    }
  }
  handleNavigateDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}
