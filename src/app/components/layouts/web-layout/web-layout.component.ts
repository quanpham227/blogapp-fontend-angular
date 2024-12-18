import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { TopbarComponent } from '../../topbar/topbar.component';

@Component({
  selector: 'app-web-layout',
  templateUrl: './web-layout.component.html',
  styleUrls: ['./web-layout.component.scss'],
  standalone: true,

  imports: [RouterModule, CommonModule, FormsModule, TopbarComponent, HeaderComponent, FooterComponent],
})
export class WebLayoutComponent {}
