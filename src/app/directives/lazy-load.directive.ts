import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad!: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.lazyLoadImage();
  }

  private lazyLoadImage() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.setAttribute(
              this.el.nativeElement,
              'src',
              this.appLazyLoad,
            );
            observer.unobserve(this.el.nativeElement);
          }
        });
      });

      observer.observe(this.el.nativeElement);
    } else {
      // Fallback nếu IntersectionObserver không được hỗ trợ
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        this.appLazyLoad,
      );
    }
  }
}
