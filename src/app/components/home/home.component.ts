import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { CountsComponent } from '../counts/counts.component';
import { ClientsComponent } from '../clients/clients.component';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    CountsComponent,
    ClientsComponent,
    RecentPostsComponent,
    ContactComponent,
  ],
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
