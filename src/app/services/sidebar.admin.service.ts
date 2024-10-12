import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarAdminService {
  private isSidebarVisible = new BehaviorSubject<boolean>(true);
  isSidebarVisible$ = this.isSidebarVisible.asObservable();

  private isMenuCollapsed = new BehaviorSubject<boolean>(false);
  isMenuCollapsed$ = this.isMenuCollapsed.asObservable();

  toggleSidebarVisibility() {
    this.isSidebarVisible.next(!this.isSidebarVisible.value);
  }
  toggleMenuCollapse(isCollapsed: boolean) {
    this.isMenuCollapsed.next(isCollapsed);
  }
}
