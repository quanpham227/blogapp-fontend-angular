import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Slide } from '../../models/slide';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideService } from '../../services/slide.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private slideService: SlideService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.getSlides();
  }

  ngAfterViewInit() {
    this.initSwiperSlides();
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
    this.slideService.getSlides().subscribe({
      next: (response: any) => {
        this.slides = response.data;
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching clients:', error);
        this.toastr.error('An error occurred while fetching clients.');
      },
    });
  }
}
