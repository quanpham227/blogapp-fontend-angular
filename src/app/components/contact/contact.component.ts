import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { About } from '../../models/about';
import { AboutService } from '../../services/about.service';
import { LoggingService } from '../../services/logging.service';
import { NewlinePipe } from '../../pipes/newline.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailService } from '../../services/email.service.';
import { ApiResponse } from '../../models/response';
import { SuccessHandlerService } from '../../services/success-handler.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Status } from '../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // Sử dụng ChangeDetectionStrategy.OnPush
  imports: [ReactiveFormsModule, CommonModule, NewlinePipe],
})
export class ContactComponent implements OnInit {
  about: About = {} as About;
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private aboutService: AboutService,
    private loggingService: LoggingService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private emailService: EmailService,
    private successDialogService: SuccessHandlerService,
  ) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });

    this.getAbout();
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      return;
    }
    this.sendEmail();
  }

  sendEmail() {
    const formData = this.contactForm.value;

    this.emailService
      .sendEmail(formData)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.contactForm.reset();
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          this.cdr.markForCheck();
        },
      });
  }

  getAbout() {
    this.aboutService
      .getAbout()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<About>) => {
          if (response.status === Status.OK && response.data) {
            this.about = response.data;
            this.cdr.markForCheck();
          }
        },
        error: (error: any) => {
          this.cdr.markForCheck();
        },
      });
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
