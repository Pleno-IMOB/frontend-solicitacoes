import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { interceptToken } from './interceptors/token.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IMOBILIARIA } from './common/common';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from '../environments/environment';
import { NgxCurrencyInputMode, provideEnvironmentNgxCurrency } from 'ngx-currency';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_TIMEPICKER_CONFIG } from '@angular/material/timepicker';
import { CurrencyPipe } from '@angular/common';

const maskConfig: Partial<NgxMaskConfig> = {
  validation: false
};

export const appConfig: ApplicationConfig = {
  providers: [
    CurrencyPipe,
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideEnvironmentNgxMask(maskConfig),
    {
      provide: 'INTERCEPTOR_HOST',
      useValue: IMOBILIARIA('procurar-empresas.vivendodevistorias.com.br')
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaV3
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([ interceptToken ])
    ),
    provideAnimations(),
    provideToastr(),
    provideEnvironmentNgxCurrency({
      align: 'right',
      allowNegative: true,
      allowZero: true,
      decimal: ',',
      precision: 2,
      prefix: 'R$ ',
      suffix: '',
      thousands: '.',
      nullable: true,
      min: null,
      max: null,
      inputMode: NgxCurrencyInputMode.Financial
    }),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: MAT_TIMEPICKER_CONFIG,
      useValue: { interval: '30 minutes' }
    }
  ]
};
