import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { interceptToken } from './interceptors/token.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMOBILIARIA } from '../lib/common';

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
      useValue: IMOBILIARIA('testecomestruturapleno.sistemaspleno.com')
    },
    provideHttpClient(
      withInterceptors([ interceptToken ])
    ),
    provideToastr(),
    provideAnimations()
  ]
};
