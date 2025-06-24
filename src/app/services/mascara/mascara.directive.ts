import { AfterViewInit, Directive, Injectable, Input, OnDestroy } from '@angular/core';
import { FormControlName } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MascaraService } from './mascara.service';

@Directive({
  selector: '[plenoMask]'
})
@Injectable({ providedIn: 'root' })
export class MascaraDirective implements AfterViewInit, OnDestroy {
  @Input('plenoMask')
  public formato?: keyof MascaraService;
  private atualizacoes?: Subscription;

  constructor (
    private ngControl: FormControlName,
    private mascara: MascaraService
  ) {
  }

  /**
   * Inicializa a diretiva após a visualização ser carregada, aplicando formatação ao valor do controle.
   * @returns {void} Não retorna valor.
   */
  ngAfterViewInit (): void {
    this.atualizacoes = this.ngControl
      ?.valueChanges
      ?.pipe(debounceTime(1))
      ?.subscribe(() => this.formatFn());

    this.formatFn();
  }

  /**
   * Limpa assinaturas e recursos ao destruir a diretiva.
   * @returns {void} Não retorna valor.
   */
  ngOnDestroy (): void {
    if ( this.atualizacoes instanceof Subscription ) {
      this.atualizacoes.unsubscribe();
    }
  }

  /**
   * Função que aplica a formatação ao valor do controle usando o formato especificado.
   * @returns {void} Não retorna valor.
   */
  private formatFn (): void {
    if ( !this.formato ) {
      return;
    }

    const formatarFn = this.mascara[this.formato] || this.mascara.padrao(this.formato);
    const valorFormatado = formatarFn(this.ngControl.value) + '';

    if ( this.ngControl.value !== valorFormatado ) {
      this.ngControl.control.setValue(valorFormatado);
    }
  };
}
