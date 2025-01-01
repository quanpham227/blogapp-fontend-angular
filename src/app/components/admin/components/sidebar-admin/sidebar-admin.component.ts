import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarAdminService } from '../../../../services/sidebar.admin.service';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './sidebar-admin.component.html',
  styleUrl: './sidebar-admin.component.scss',
})
export class SidebarAdminComponent implements OnInit {
  activeComponent: string = ''; // Thêm thuộc tính này
  navStates: { [key: string]: boolean } = {
    postNav: false,
    userNav: false,
    interfaceNav: false,
    settingNav: false,
    // Thêm các nav khác nếu cần
  };
  isMenuCollapsed: boolean = false;
  isSidebarVisible: boolean = true;

  constructor(
    private router: Router,
    private sidebarService: SidebarAdminService,
  ) {}

  ngOnInit() {
    this.sidebarService.isSidebarVisible$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });
    this.checkScreenSize();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768 && this.isSidebarVisible) {
      this.sidebarService.toggleSidebarVisibility();
    } else if (screenWidth >= 768 && !this.isSidebarVisible) {
      this.sidebarService.toggleSidebarVisibility();
    }
  }
  showAdminComponent(componentName: string): void {
    this.activeComponent = componentName;
    this.router.navigate([`/admin/${componentName}`]);
    if (window.innerWidth < 768) {
      this.sidebarService.toggleSidebarVisibility();
    }
  }

  toggleNav(nav: string, firstSubComponent: string) {
    this.navStates[nav] = !this.navStates[nav];
    if (this.navStates[nav]) {
      this.activeComponent = firstSubComponent;
      this.showAdminComponent(firstSubComponent);
    }
  }
  toggleMenuCollapse() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this.sidebarService.toggleMenuCollapse(this.isMenuCollapsed);
    if (this.isMenuCollapsed) {
      // Đóng tất cả các menu con khi sidebar thu nhỏ
      for (const nav in this.navStates) {
        if (this.navStates.hasOwnProperty(nav)) {
          this.navStates[nav] = false;
        }
      }
    }
  }
}
