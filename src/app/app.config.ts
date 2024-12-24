import { ApplicationConfig, importProvidersFrom, Provider, APP_INITIALIZER } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { HttpClientModule, provideHttpClient, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorModule } from '@tinymce/tinymce-angular';
import { LazyLoadDirective } from './directives/lazy-load.directive';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { initializeApp } from './app.initializer';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { HttpStatusInterceptor } from './interceptors/http-status.interceptor';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
import { NewlinePipe } from './pipes/newline.pipe';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    tokenInterceptorProvider,
    loadingInterceptorProvider,
    apiResponseInterceptorProvider,
    HttpStatusInterceptor,
    importProvidersFrom(
      HttpClientModule,
      BrowserAnimationsModule,
      EditorModule,
      LoadingBarHttpClientModule,
      LoadingBarRouterModule,
      NgxPageScrollCoreModule.forRoot({ duration: 800 }),
    ),
    provideHttpClient(),
    NewlinePipe,
    importProvidersFrom(LazyLoadDirective),
    provideAnimationsAsync(),
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
    provideAnimationsAsync(),
  ],
};
