import { trigger, transition, style, animate } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
]);
export const fadeInOutAnimation = trigger('fadeInOut', [
  transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))]),
  transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
]);
