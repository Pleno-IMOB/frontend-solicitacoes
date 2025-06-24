import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor (private sanitized: DomSanitizer) {
  }

  /**
   * Sanitiza um valor com base no tipo especificado, garantindo segurança contra injeções.
   * @param value Valor a ser sanitizado.
   * @param tipo Tipo de sanitização a ser aplicada ('html', 'style', 'script', 'url', 'resourceUrl').
   * @return Valor sanitizado ou o valor original se já estiver seguro.
   */
  transform (value: any, tipo: 'html' | 'style' | 'script' | 'url' | 'resourceUrl') {
    if ( value !== null && typeof value === 'object' && 'changingThisBreaksApplicationSecurity' in value ) {
      return value;
    }

    switch ( tipo ) {
      case 'html':
        return !value ? '' : this.sanitized.bypassSecurityTrustHtml(value);

      case 'style':
        return !value ? '' : this.sanitized.bypassSecurityTrustStyle(value);

      case 'script':
        return !value ? '' : this.sanitized.bypassSecurityTrustScript(value);

      case 'url':
        return !value ? '' : this.sanitized.bypassSecurityTrustUrl(value);

      case 'resourceUrl':
        return !value ? '' : this.sanitized.bypassSecurityTrustResourceUrl(value);
    }
  }
}
