import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { Toast, ToasterService } from '../../../services/toaster.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toastr',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './toastr.component.html',
  styleUrl: './toastr.component.scss',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ transform: 'translateX(100%)', opacity: 0 }))]),
    ]),
  ],
})
export class ToastrComponent implements OnInit, OnDestroy {
  private toasterService = inject(ToasterService);
  toasts: Toast[] = [];
  private subscription!: Subscription;

  ngOnInit(): void {
    this.subscription = this.toasterService.toasts$.subscribe((toasts) => (this.toasts = toasts));
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  removeToast = (id: number) => this.toasterService.remove(id);
  pauseToast = (id: number) => this.toasterService.pause(id);

  trackById(index: number, toast: Toast): number {
    return toast.id;
  }
}
