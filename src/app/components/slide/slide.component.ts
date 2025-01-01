import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Slide } from '../../models/slide';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideService } from '../../services/slide.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiResponse } from '../../models/response';
import { Status } from '../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SlideComponent implements OnInit, AfterViewInit {
  slides: Slide[] = [];
  swiperSlides: Swiper | null = null;
  isLoading = true;
  defaultSlides = [
    { imageUrl: 'https://res.cloudinary.com/damphlbsi/image/upload/v1735118600/slide_01_wij5fn.jpg' },
    { imageUrl: 'https://res.cloudinary.com/damphlbsi/image/upload/v1726736214/blogapp/slides/rh6nvmxmr6hmv8zk9cdl.jpg' },
    { imageUrl: 'https://res.cloudinary.com/damphlbsi/image/upload/v1726736194/blogapp/slides/eicbzthcl0vptudmy02d.jpg' },
  ];
  constructor(private slideService: SlideService, private cdr: ChangeDetectorRef) {}

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
    this.swiperSlides = new Swiper('#slideCarousel', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.slide__pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.slide__button-next',
        prevEl: '.slide__button-prev',
      },
    });
  }

  getSlides() {
    this.slideService
      .getActiveSlidesForUser()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Slide[]>) => {
          if (response.status === Status.OK && response.data) {
            this.slides = response.data;
            this.isLoading = false;
            this.cdr.detectChanges();
            setTimeout(() => {
              this.initSwiperSlides();
            }, 0);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }
}
