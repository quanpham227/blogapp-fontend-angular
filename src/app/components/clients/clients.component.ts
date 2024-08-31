import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swiper, { Pagination, Autoplay, Navigation } from 'swiper';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

Swiper.use([Pagination, Autoplay, Navigation]);

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ClientsComponent implements OnInit, AfterViewInit {
  clients: Client[] = [];
  swiperClients: Swiper | null = null;

  constructor(
    private clientService: ClientService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    this.getClients();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSwiperClients();
    }
  }

  private initSwiperClients() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.swiperClients) {
        this.swiperClients.destroy(true, true);
      }

      const swiperContainer = document.querySelector('.clients-slider');
      if (!swiperContainer) {
        console.error('Swiper container not found');
        return;
      }

      this.swiperClients = new Swiper('.clients-slider', {
        speed: 400,
        loop: true,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
          stopOnLastSlide: false,
          reverseDirection: false,
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        },
        breakpoints: {
          320: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 60,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 80,
          },
          992: {
            slidesPerView: 6,
            spaceBetween: 120,
          },
        },
      });

      console.log('Swiper initialized:', this.swiperClients);
    }
  }

  getClients() {
    this.clientService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.data;
        console.log(response.data);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initSwiperClients(); // Initialize Swiper after clients are loaded and DOM is updated
          }, 0);
        }
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching recent clients:', error);
      },
    });
  }
}
