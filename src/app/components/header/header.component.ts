import { Component, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { NgbPopover, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { throttle } from 'lodash';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgbPopover, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  activeNavItem: number = 0;
  userResponse?: UserResponse | null;
  isPopoverOpen = false;
  lastScrollTop = 0;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
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
      topBar?.classList.add('topbar-hidden');
      header?.classList.add('topbar-hidden');
    } else {
      // Cuộn lên
      topBar?.classList.remove('topbar-hidden');
      header?.classList.remove('topbar-hidden');
    }
    this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }, 200);

  scrollToSection(id: string, index: number) {
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.scrollToElement(id, index);
        }, 100); // Điều chỉnh thời gian chờ nếu cần thiết
      });
    } else {
      this.scrollToElement(id, index);
    }
  }

  private scrollToElement(id: string, index: number) {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90; // You can adjust this value to get the desired result
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    this.setActiveNavItem(index);
  }

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  handleBlogClick(event: Event): void {
    this.toggleDropdown(event);
    this.setActiveNavItem(3);
  }

  setActiveNavItem(index: number): void {
    this.activeNavItem = index;
  }

  handleItemClick(index: number): void {
    if (index === 1) {
      this.userService.logout();
    } else if (index === 0) {
      this.router.navigate(['/user-profile']);
    }
    this.isPopoverOpen = false; // Close the popover after clicking an item
  }

  /**
   * Mobile nav toggle
   */
  toggleMobileNav(event: Event) {
    const navbar = document.querySelector('#navbar') as HTMLElement;
    navbar.classList.toggle('navbar-mobile');
    const target = event.target as HTMLElement;
    target.classList.toggle('bi-list');
    target.classList.toggle('bi-x');
  }

  /**
   * Mobile nav dropdowns activate
   */
  toggleDropdown(event: Event) {
    const navbar = document.querySelector('#navbar') as HTMLElement;
    if (navbar.classList.contains('navbar-mobile')) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const nextElement = target.nextElementSibling as HTMLElement;
      nextElement.classList.toggle('dropdown-active');
    }
  }
}
