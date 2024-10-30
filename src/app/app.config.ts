import { ApplicationConfig, importProvidersFrom, Provider, APP_INITIALIZER } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { HttpClientModule, provideHttpClient, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorModule } from '@tinymce/tinymce-angular';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgbDatepickerConfig, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MonthYearFormatter } from '../app/components/admin/shared/month-year-formatter';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { initializeApp } from './app.initializer';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { HttpStatusInterceptor } from './interceptors/http-status.interceptor';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';

const tokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
};
const loadingInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: LoadingInterceptor,
  multi: true,
};
const apiResponseInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiResponseInterceptor,
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
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    tokenInterceptorProvider,
    loadingInterceptorProvider,
    apiResponseInterceptorProvider,
    HttpStatusInterceptor,
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
    { provide: NgbDateParserFormatter, useClass: MonthYearFormatter },
    ngbDatepickerConfigProvider,
    AuthService,
    TokenService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TokenService, AuthService],
      multi: true,
    },
    importProvidersFrom(LoadingBarHttpClientModule),
    importProvidersFrom(LoadingBarRouterModule),
    // provideLoadingBar({ latencyThreshold: 100 }),
  ],
};
