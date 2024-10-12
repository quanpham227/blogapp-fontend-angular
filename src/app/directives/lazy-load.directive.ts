import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad!: string;
  @Input() transitionDuration: string = '0.5s'; // Thời gian chuyển đổi mặc định
  private observer: IntersectionObserver | null = null;
  private isImageLoaded: boolean = false; // Cờ để theo dõi xem ảnh đã được tải hay chưa

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.lazyLoadImage();
  }
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  public lazyLoadImage() {
    if (this.isImageLoaded) {
      return; // Thoát nếu ảnh đã được tải
    }
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.setStyle(
              this.el.nativeElement,
              'transition',
              `opacity ${this.transitionDuration} ease-in-out`,
            );
            this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            this.renderer.setAttribute(
              this.el.nativeElement,
              'src',
              this.appLazyLoad,
            );
            this.el.nativeElement.onload = () => {
              this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            };
            observer.unobserve(this.el.nativeElement);
          }
        });
      });

      observer.observe(this.el.nativeElement);
    } else {
      // Fallback nếu IntersectionObserver không được hỗ trợ
      console.log(
        `IntersectionObserver not supported, loading image: ${this.appLazyLoad}`,
      );

      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        this.appLazyLoad,
      );
      this.isImageLoaded = true;
    }
  }
}
