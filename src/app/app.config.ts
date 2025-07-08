import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { interceptToken } from './interceptors/token.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMOBILIARIA } from './common/common';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from '../environments/environment';

const maskConfig: Partial<NgxMaskConfig> = {
  validation: false
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideEnvironmentNgxMask(maskConfig),
    {
      provide: 'INTERCEPTOR_HOST',
      useValue: IMOBILIARIA('realcheck.sistemaspleno.com')
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaV3
    },
    provideHttpClient(
      withInterceptors([ interceptToken ])
    ),
    provideToastr(),
    provideAnimations()
  ]
};
