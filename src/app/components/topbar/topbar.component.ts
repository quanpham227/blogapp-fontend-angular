import { CommonModule } from '@angular/common';
import { Component, HostListener, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import throttle from 'lodash-es/throttle';
import { AuthService } from '../../services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  activeNavItem: number = 0;
  userResponse?: UserResponse | null;
  isMenuOpen = false;
  lastScrollTop = 0;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.checkUserStatus();
    this.authService.user$.pipe(untilDestroyed(this)).subscribe({
      next: (user) => {
        this.userResponse = user;
      },
      error: (err) => {
        console.error('Error fetching user data', err);
      },
    });
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

  @HostListener('window:scroll', [])
  onWindowScroll = throttle(() => {
    const topBar = document.getElementById('topbar');
    const header = document.getElementById('header');
    const st = window.scrollY || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      // Cuộn xuống
      this.renderer.addClass(topBar, 'topbar-hidden');
      this.renderer.addClass(header, 'topbar-hidden');
    } else {
      // Cuộn lên
      this.renderer.removeClass(topBar, 'topbar-hidden');
      this.renderer.removeClass(header, 'topbar-hidden');
    }
    this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }, 200);

  handleItemClick(index: number): void {
    if (index === 1) {
      this.userService.logout();
      this.authService.setUser(null); // Cập nhật trạng thái người dùng
      this.userResponse = null; // Cập nhật trạng thái người dùng trong component
    } else if (index === 0) {
      this.router.navigate(['/user-profile']);
    }
    this.isMenuOpen = false;
    this.removeClickOutsideListener();
  }

  toggleMenu(event: Event) {
    event.preventDefault();
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    } else {
      this.removeClickOutsideListener();
    }
  }

  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar__login-menu') && !target.closest('.topbar__login-user')) {
      this.isMenuOpen = false;
      this.removeClickOutsideListener();
    }
  }

  removeClickOutsideListener() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
}
