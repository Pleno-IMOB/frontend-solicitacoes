import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor () {
  }

  /**
   * Define o atributo 'platform' no elemento <body> do documento
   * com base no sistema operacional detectado.
   * @return {void}
   */
  public setPlatformBody (): void {
    const body = window.document.body;
    if ( this.isIOS() ) {
      body.setAttribute('platform', 'ios');
    } else if ( this.isAndroid() ) {
      body.setAttribute('platform', 'android');
    } else {
      body.setAttribute('platform', 'web');
    }
  }

  /**
   * Verifica se o dispositivo é um iPhone, iPad ou iPod.
   * @return Retorna verdadeiro se o dispositivo for um iPhone, iPad ou iPod, e falso caso contrário.
   */
  private isIOS (): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  /**
   * Verifica se o dispositivo em uso é um Android.
   * @return {boolean} Retorna verdadeiro se o dispositivo for Android, falso caso contrário.
   */
  private isAndroid (): boolean {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Verifica se a plataforma atual é um ambiente web.
   * @return {boolean} Retorna verdadeiro se a plataforma não for iOS nem Android, indicando que é um ambiente web.
   */
  private isWeb (): boolean {
    return !this.isIOS() && !this.isAndroid();
  }
}