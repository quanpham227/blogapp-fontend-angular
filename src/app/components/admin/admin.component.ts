import { Component, Inject, OnInit } from '@angular/core';
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
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = this.userService.getFromLocalStorage();
    this.router.navigate(['/login']);
  }

  showAdminComponent(componentName: string): void {
    this.activeComponent = componentName;
    this.router.navigate([`/admin/${componentName}`]);
  }
}
