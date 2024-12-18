import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ToastrComponent } from '../components/common/toastr/toastr.component';
import { slideInAnimation } from '../animations/animations';
import { LoadingSpinnerComponent } from '../components/common/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation],
  imports: [CommonModule, RouterModule, LoadingBarHttpClientModule, LoadingSpinnerComponent, LoadingBarRouterModule, ToastrComponent],
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
