import { Component, OnInit, Renderer2, Inject, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PageScrollService, PageScrollInstance } from 'ngx-page-scroll-core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { UserResponse } from '../../responses/user/user.response';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const SCROLL_OFFSET = 90;
const SCROLL_ADJUSTMENT = 100;

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2,
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any,
    private el: ElementRef,
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

    this.setActiveNavItemBasedOnUrl(this.router.url);

    // Listen for scroll events to update menu active state
    this.renderer.listen(this.el.nativeElement, 'scroll', this.onScroll.bind(this));
    this.renderer.listen(this.el.nativeElement, 'touchmove', this.onTouchMove.bind(this));
    this.renderer.listen(this.el.nativeElement, 'touchstart', this.onTouchStart.bind(this));
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

    let isNavItemSet = false;

    for (const path in navItemMap) {
      if (url === path) {
        this.activeNavItem = navItemMap[path];
        isNavItemSet = true;
        break;
      }
    }

    // If URL starts with '/blog/' but is not '/blog', do not activate any item
    if (!isNavItemSet && url.startsWith('/blog/')) {
      this.activeNavItem = -1;
    }
  }

  scrollToSection(id: string, index: number) {
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        this.waitForHomeToLoad(() => {
          this.scrollToElement(id);
          this.setActiveNavItem(index);
        });
      });
    } else {
      this.scrollToElement(id);
      this.setActiveNavItem(index);
    }
  }
  private scrollToElement(id: string) {
    const pageScrollInstance: PageScrollInstance = this.pageScrollService.create({
      document: this.document,
      scrollTarget: `#${id}`,
      scrollOffset: SCROLL_OFFSET,
    });
    this.pageScrollService.start(pageScrollInstance);
  }

  private waitForHomeToLoad(callback: () => void) {
    const checkInterval = 50;
    const maxWaitTime = 2000;
    let elapsedTime = 0;

    const interval = setInterval(() => {
      if (document.getElementById('slide')) {
        clearInterval(interval);
        callback();
      } else if (elapsedTime >= maxWaitTime) {
        clearInterval(interval);
        console.error('Home did not load in time.');
      } else {
        elapsedTime += checkInterval;
      }
    }, checkInterval);
  }

  handleBlogClick(event: Event): void {
    this.setActiveNavItem(3);
    this.router.navigate(['/blog']).then(() => {
      this.setActiveNavItem(3);
    });
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

  private onScroll() {
    const sections = [
      { id: 'slide', index: 0 },
      { id: 'about', index: 1 },
      { id: 'clients', index: 2 },
      { id: 'contact', index: 4 },
    ];

    const scrollPosition = window.scrollY + SCROLL_ADJUSTMENT;

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) {
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          this.setActiveNavItem(section.index);
          break;
        }
      }
    }
  }

  private onTouchMove(event: Event) {
    // Xử lý sự kiện touchmove
  }

  private onTouchStart(event: Event) {
    // Xử lý sự kiện touchstart
  }
}
