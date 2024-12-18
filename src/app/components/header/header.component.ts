import { Component, OnInit, Renderer2 } from '@angular/core';
import { UserResponse } from '../../responses/user/user.response';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  activeNavItem: number = 0;
  userResponse?: UserResponse | null;
  isMenuOpen = false;
  lastScrollTop = 0;

  constructor(
    private router: Router,
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

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe((event: NavigationEnd) => {
        this.setActiveNavItemBasedOnUrl(event.urlAfterRedirects);
      });

    // Đặt lại activeNavItem dựa trên URL hiện tại
    this.setActiveNavItemBasedOnUrl(this.router.url);
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

  private setActiveNavItemBasedOnUrl(url: string) {
    const navItemMap: { [key: string]: number } = {
      '/': 0,
      '/about': 1,
      '/clients': 2,
      '/blog': 3,
      '/contact': 4,
    };

    // Kiểm tra nếu URL có khớp với một trong các URL trong map
    for (const path in navItemMap) {
      if (url.includes(path)) {
        this.activeNavItem = navItemMap[path];
        break;
      }
    }
  }

  scrollToSection(id: string, index: number) {
    if (this.router.url !== '/') {
      // Nếu không phải trang home, chuyển về home trước
      this.router.navigate(['/']).then(() => {
        this.waitForHomeToLoad(() => {
          this.scrollToElement(id);
          this.setActiveNavItem(index);
        });
      });
    } else {
      // Nếu đang ở home, cuộn trực tiếp
      this.scrollToElement(id);
      this.setActiveNavItem(index);
    }
  }

  private waitForHomeToLoad(callback: () => void) {
    const checkInterval = 50; // Kiểm tra mỗi 50ms
    const maxWaitTime = 2000; // Thời gian tối đa chờ (2 giây)
    let elapsedTime = 0;

    const interval = setInterval(() => {
      if (document.getElementById('slide')) {
        // Nếu phần tử home đã load, thực hiện callback
        clearInterval(interval);
        callback();
      } else if (elapsedTime >= maxWaitTime) {
        // Nếu quá thời gian chờ, dừng kiểm tra
        clearInterval(interval);
        console.error('Home did not load in time.');
      } else {
        elapsedTime += checkInterval;
      }
    }, checkInterval);
  }

  private scrollToElement(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90; // Adjust based on header height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      console.error(`Element with ID ${id} not found.`);
    }
  }

  handleBlogClick(event: Event): void {
    this.toggleDropdown(event);
    this.setActiveNavItem(3);
  }

  setActiveNavItem(index: number): void {
    this.activeNavItem = index;
  }

  toggleMobileNav(event: Event) {
    const navbar = document.querySelector('#navbar') as HTMLElement;
    const icon = document.getElementById('mobile-nav-icon') as HTMLElement;
    const header = document.getElementById('header') as HTMLElement;

    if (navbar && icon && header) {
      if (navbar.classList.contains('navbar-mobile')) {
        this.renderer.removeClass(navbar, 'navbar-mobile');
        this.renderer.removeClass(icon, 'fa-times');
        this.renderer.addClass(icon, 'fa-bars');
        this.renderer.removeClass(header, 'menu-open');
      } else {
        this.renderer.addClass(navbar, 'navbar-mobile');
        this.renderer.removeClass(icon, 'fa-bars');
        this.renderer.addClass(icon, 'fa-times');
        this.renderer.addClass(header, 'menu-open');
      }
    }
  }

  toggleDropdown(event: Event) {
    const target = event.target as HTMLElement;
    const nextElement = target?.nextElementSibling as HTMLElement;

    if (nextElement && nextElement.classList) {
      if (nextElement.classList.contains('dropdown-active')) {
        this.renderer.removeClass(nextElement, 'dropdown-active');
      } else {
        this.renderer.addClass(nextElement, 'dropdown-active');
      }
    }
  }
}
