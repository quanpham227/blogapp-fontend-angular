import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { AboutService } from '../../services/about.service';
import { ApiResponse } from '../../models/response';
import { About } from '../../models/about';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements OnInit {
  about: About = {} as About;
  constructor(private aboutService: AboutService) {}

  ngOnInit() {
    this.getAbout();
  }

  getAbout() {
    this.aboutService.getAbout().subscribe({
      next: (response: any) => {
        this.about = response.data;
        console.log(response.data);
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching recent clients:', error);
      },
    });
  }
}
