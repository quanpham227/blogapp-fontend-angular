import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
})
export class AdminComponent implements OnInit {
  userResponse?: UserResponse | null;
  activeComponent: string = ''; // Thêm thuộc tính này
  localStorage?: Storage;
  isSidebarVisible: boolean = true;
  navStates: { [key: string]: boolean } = {
    postNav: false,
    userNav: false,
    interfaceNav: false,
    settingNav: false,
    // Thêm các nav khác nếu cần
  };
  isMenuCollapsed: boolean = false;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
  }

  ngOnInit() {
    this.userResponse = this.userService.getFromLocalStorage();

    this.router.events.subscribe((event: any) => {
      if (event.url) {
        this.activeComponent = event.url.split('/').pop() || 'dashboard';
      }
    });
  }

  logout() {
    this.userService.logout();
  }

  showAdminComponent(componentName: string): void {
    this.activeComponent = componentName;
    this.router.navigate([`/admin/${componentName}`]);
  }
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
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
    if (this.isMenuCollapsed) {
      // Đóng tất cả các menu con khi sidebar thu nhỏ
      for (let nav in this.navStates) {
        if (this.navStates.hasOwnProperty(nav)) {
          this.navStates[nav] = false;
        }
      }
    }
  }
}
