import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { mockFallbackInterceptor } from './core/mock/mock-fallback.interceptor';
import { environment } from '../environments/environment';

ModuleRegistry.registerModules([AllCommunityModule]);

const I18N_VERSION = '1';
const createTranslateLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, 'i18n/', `.json?v=${I18N_VERSION}`);

const initTranslations = (translate: TranslateService) => () => {
  const saved = localStorage.getItem('lang') ?? 'es';
  translate.setDefaultLang('es');
  translate.use(saved);
};

const httpInterceptors = [authInterceptor];
if (!environment.production) {
  httpInterceptors.push(mockFallbackInterceptor);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors(httpInterceptors)
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true
    },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    )
  ]
};
