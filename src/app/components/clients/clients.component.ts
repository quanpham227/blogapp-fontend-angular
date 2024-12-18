import { AfterViewInit, Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import Swiper, { Pagination, Autoplay, Navigation } from 'swiper';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

Swiper.use([Pagination, Autoplay, Navigation]);

@UntilDestroy()
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ClientsComponent implements OnInit, AfterViewInit {
  clients: Client[] = [];
  private swiperClients: Swiper | null = null;

  constructor(
    private clientService: ClientService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getClients();
  }

  ngAfterViewInit() {
    if (this.clients.length > 0) {
      this.initSwiperClients();
    }
  }

  protected initSwiperClients() {
    this.destroySwiper();
    this.ngZone.runOutsideAngular(() => {
      this.swiperClients = new Swiper('.clients__slider', {
        speed: 400,
        loop: true,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.clients__swiper-pagination',
          type: 'bullets',
          clickable: true,
        },
        breakpoints: {
          320: { slidesPerView: 2, spaceBetween: 40 },
          480: { slidesPerView: 3, spaceBetween: 60 },
          640: { slidesPerView: 4, spaceBetween: 80 },
          992: { slidesPerView: 6, spaceBetween: 120 },
        },
      });
    });
  }

  protected destroySwiper() {
    if (this.swiperClients) {
      this.swiperClients.destroy(true, true);
      this.swiperClients = null;
    }
  }

  getClients() {
    this.clientService
      .getClients()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          this.clients = response.data;
          this.cdr.detectChanges();
          this.initSwiperClients();
        },
        error: (error: any) => {},
      });
  }
}
