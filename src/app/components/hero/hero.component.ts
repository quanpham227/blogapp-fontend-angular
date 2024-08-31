import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Slide } from '../../models/slide';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor() {}

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
    // Gán dữ liệu mẫu trực tiếp cho slides
    this.slides = [
      {
        id: 1,
        title: 'WELCOME TO PI VINA DANANG',
        description: '',
        image:
          'https://drive.google.com/thumbnail?id=1NF3-OFGlc3L1TQ4FEWQ6n8RSxTRQ70JA&sz=w4000',
      },
      {
        id: 2,
        title: '',
        description: '',
        image:
          'https://drive.google.com/thumbnail?id=1j6wAQG_hCBuMshS-prR14KZNK9W_VP1Z&sz=w4000',
      },
      {
        id: 3,
        title: '',
        description: '',
        image:
          'https://drive.google.com/thumbnail?id=1G4KrVKKmV3NSHGrbYauDD_m1jMlpGnnv&sz=w4000',
      },
    ];
  }
}
