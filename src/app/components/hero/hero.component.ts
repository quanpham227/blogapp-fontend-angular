import { AfterViewInit, Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Slide } from '../../models/slide';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideService } from '../../services/slide.service';
import { LoggingService } from '../../services/logging.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class HeroComponent implements OnInit, AfterViewInit {
  slides: Slide[] = [];
  swiperSlides: Swiper | null = null;
  isLoading = true;

  constructor(
    private slideService: SlideService,
    private loggingService: LoggingService,
  ) {}

  ngOnInit() {
    this.getSlides();
  }

  ngAfterViewInit() {
    if (this.slides.length > 0) {
      this.initSwiperSlides();
    }
  }

  private initSwiperSlides() {
    if (this.swiperSlides) {
      this.swiperSlides.destroy(true, true);
    }
    this.swiperSlides = new Swiper('#heroCarousel', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000, // Time between slides
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  getSlides() {
    this.slideService
      .getSlides()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          this.slides = response.data;
          this.isLoading = false;
          // Re-initialize Swiper after slides are loaded
          setTimeout(() => {
            this.initSwiperSlides();
          }, 0);
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }
}
