import { Component, Inject, OnInit } from '@angular/core';
import { UserResponse } from '../../../../responses/user/user.response';
import { UserService } from '../../../../services/user.service';
import { TokenService } from '../../../../services/token.service';
import { Router } from 'express';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarAdminService } from '../../../../services/sidebar.admin.service';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss',
})
export class HeaderAdminComponent implements OnInit {
  userResponse?: UserResponse | null;
  activeComponent: string = ''; // Thêm thuộc tính này
  localStorage?: Storage;
  isSidebarVisible: boolean = true;
  constructor(
    private userService: UserService,
    private sidebarService: SidebarAdminService,

    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
  }

  ngOnInit() {
    // Subscribe to the sidebar visibility
    this.sidebarService.isSidebarVisible$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });
    this.userResponse = this.userService.getFromLocalStorage();
  }

  logout() {
    this.userService.logout();
  }
  toggleSidebar() {
    this.sidebarService.toggleSidebarVisibility();
  }
}
