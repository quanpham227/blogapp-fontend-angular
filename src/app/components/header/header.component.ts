import { Component, OnInit, HostListener } from '@angular/core';
import { NgbPopover, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from '../../responses/user/user.response';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgbPopover, RouterModule],
})
export class HeaderComponent implements OnInit {
  activeNavItem: number = 0;
  userResponse?: UserResponse | null;
  isPopoverOpen = false;
  lastScrollTop = 0;

  constructor(
    private userService: UserService,
    private popoverConfig: NgbPopoverConfig,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userResponse = this.userService.getFromLocalStorage();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const topbar = document.getElementById('topbar');
    const header = document.getElementById('header');
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      // Cuộn xuống
      topbar?.classList.add('topbar-hidden');
      header?.classList.add('topbar-hidden');
    } else {
      // Cuộn lên
      topbar?.classList.remove('topbar-hidden');
      header?.classList.remove('topbar-hidden');
    }
    this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
  }

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
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
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
