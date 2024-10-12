import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorModule } from '@tinymce/tinymce-angular';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  NgbDatepickerConfig,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { MonthYearFormatter } from '../app/components/admin/shared/month-year-formatter';
const tokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
};

const ngbDatepickerConfigProvider: Provider = {
  provide: NgbDatepickerConfig,
  useFactory: () => {
    const config = new NgbDatepickerConfig();
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: 2100, month: 12, day: 31 };
    config.displayMonths = 1;
    config.navigation = 'select';
    config.weekdays = false; // Sử dụng thuộc tính 'weekdays' thay vì 'showWeekdays'
    config.showWeekNumbers = false;
    return config;
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // importProvidersFrom(RouterModule.forChild(adminRoutes)),
    provideHttpClient(withFetch()),
    tokenInterceptorProvider,
    provideClientHydration(),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(),
    importProvidersFrom(EditorModule),
    importProvidersFrom(LazyLoadDirective),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      easeTime: 300,
      tapToDismiss: true,
      progressAnimation: 'increasing',
    }),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    { provide: NgbDateParserFormatter, useClass: MonthYearFormatter },
    ngbDatepickerConfigProvider,
  ],
};
