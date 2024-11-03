import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AboutService } from '../../services/about.service';
import { About } from '../../models/about';
import { LoggingService } from '../../services/logging.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./about.component.scss'],
  standalone: true,
})
export class AboutComponent implements OnInit {
  about: About = {} as About;
  isLoading = true;

  constructor(
    private aboutService: AboutService,
    private loggingService: LoggingService,
  ) {}

  ngOnInit() {
    this.getAbout();
  }

  getAbout() {
    this.aboutService
      .getAbout()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.about = response.data;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }
}
