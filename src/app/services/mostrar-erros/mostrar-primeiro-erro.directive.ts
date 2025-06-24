import { AfterViewInit, Directive, EventEmitter, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[plenoPrimeiroErro]'
})
export class MostrarPrimeiroErroDirective implements AfterViewInit, OnDestroy {
  public submit = new EventEmitter();
  private campos: { input: any; control: NgControl; y?: number }[] = [];
  private onSubmit?: Subscription;

  private ordenarCampos$ = new BehaviorSubject([]);
  private ordenarCampos?: Subscription;

  /**
   * Inicializa assinaturas e ordena campos após a visualização ser carregada.
   * @return Não retorna valor.
   */
  ngAfterViewInit () {
    this.onSubmit = this.submit.subscribe(() => {
      const invalid = this.campos.filter(c => c.control.invalid);
      this.focarInput(invalid[0] && invalid[0].input);
    });

    /* obtem a posição do input na tela */
    const posicao = (i: any) =>
      i && typeof i.getLocationInWindow === 'function' && i.getLocationInWindow();

    /* ordena os campos pela posição y em que eles estão na tela */
    this.ordenarCampos = this.ordenarCampos$.pipe(debounceTime(500)).subscribe(() => {
      this.campos = this.campos
        .map(c => ({ ...c, y: (posicao(c.input) || { y: 0 }).y }))
        .sort((a, b) => a.y - b.y);
    });
  }

  /**
   * Limpa assinaturas de eventos ao destruir a diretiva para evitar vazamentos de memória.
   * @return Não retorna valor.
   */
  ngOnDestroy () {
    if ( this.onSubmit instanceof Subscription ) {
      this.onSubmit.unsubscribe();
    }

    if ( this.ordenarCampos instanceof Subscription ) {
      this.ordenarCampos.unsubscribe();
    }
  }

  /**
   * Registra um novo campo de entrada e seu controle associado.
   * @param input Elemento de entrada a ser registrado.
   * @param control Controle Angular associado ao elemento de entrada.
   * @return Não retorna valor.
   */
  registrarInput (input: any, control: NgControl) {
    this.campos = [ ...this.campos, { input, control } ];
    this.ordenarCampos$.next(this.campos as any);
  }

  /**
   * Move o foco para o próximo campo de entrada na lista de campos registrados.
   * @param input Elemento de entrada atual.
   * @return Não retorna valor.
   */
  irParaProximoCampo (input: any) {
    const index = this.campos.findIndex(v => v.input === input);
    const proximoCampo = this.campos[index + 1];

    if ( index !== -1 && proximoCampo ) {
      this.focarInput(proximoCampo.input);
    }
  }

  /**
   * Define o foco no campo de entrada especificado.
   * @param input Elemento de entrada a ser focado.
   * @return Não retorna valor.
   */
  focarInput (input: any) {
    if ( input && typeof input.focus === 'function' ) {
      input.focus();

      if ( input.android ) {
        // emite evento para garantir que o KeyboardToolbar apareça corretamente
        input.notify({ eventName: 'focus', object: input });
      }
    }
  }
}
