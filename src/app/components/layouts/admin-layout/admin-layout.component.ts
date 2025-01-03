import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../admin/components/header-admin/header-admin.component';
import { FooterAdminComponent } from '../../admin/components/footer-admin/footer-admin.component';
import { SidebarAdminComponent } from '../../admin/components/sidebar-admin/sidebar-admin.component';
import { SidebarAdminService } from '../../../services/sidebar.admin.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { slideInAnimation } from '../../../animations/animations';

@UntilDestroy()
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: true,
  animations: [slideInAnimation],

  imports: [RouterModule, CommonModule, FormsModule, HeaderAdminComponent, FooterAdminComponent, SidebarAdminComponent],
})
export class AdminLayoutComponent implements OnInit {
  isSidebarVisible: boolean = true;
  isMenuCollapsed: boolean = false;

  constructor(private sidebarService: SidebarAdminService) {}

  ngOnInit(): void {
    this.sidebarService.isSidebarVisible$.pipe(untilDestroyed(this)).subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });
    this.sidebarService.isMenuCollapsed$.pipe(untilDestroyed(this)).subscribe((isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
