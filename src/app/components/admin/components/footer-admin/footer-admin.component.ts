import { Component, OnInit } from '@angular/core';
import { SidebarAdminService } from '../../../../services/sidebar.admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-admin.component.html',
  styleUrls: ['./footer-admin.component.scss'],
})
export class FooterAdminComponent implements OnInit {
  isSidebarVisible: boolean = true;
  isMenuCollapsed: boolean = false;
  constructor(private sidebarService: SidebarAdminService) {}

  ngOnInit(): void {
    this.sidebarService.isSidebarVisible$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });

    this.sidebarService.isMenuCollapsed$.subscribe((isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }
}
