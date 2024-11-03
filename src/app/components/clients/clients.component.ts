import { AfterViewInit, Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import Swiper, { Pagination, Autoplay, Navigation } from 'swiper';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoggingService } from '../../services/logging.service';
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
  private subscriptions: Subscription = new Subscription();

  constructor(
    private clientService: ClientService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private logingService: LoggingService,
  ) {}

  ngOnInit() {
    this.getClients();
  }

  ngAfterViewInit() {
    // Swiper sẽ được khởi tạo lại sau khi clients được tải
    if (this.clients.length > 0) {
      this.initSwiperClients();
    }
  }

  private initSwiperClients() {
    this.destroySwiper(); // Hủy swiper nếu đã tồn tại trước đó
    this.ngZone.runOutsideAngular(() => {
      this.swiperClients = new Swiper('.clients-slider', {
        speed: 400,
        loop: true,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.swiper-pagination',
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

  private destroySwiper() {
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
          this.cdr.detectChanges(); // Cập nhật view sau khi dữ liệu clients thay đổi
          this.initSwiperClients(); // Khởi tạo lại Swiper sau khi có dữ liệu
        },
        error: (error: any) => {
          this.logingService.logError('Error loading clients', error);
        },
      });
  }
}
