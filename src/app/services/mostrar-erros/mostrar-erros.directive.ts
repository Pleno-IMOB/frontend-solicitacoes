import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, merge, of, Subscription } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { MostrarPrimeiroErroDirective } from './mostrar-primeiro-erro.directive';
import { ErrosFormularioService } from './erros-formulario.service';

declare const $: any;

@Directive({
  selector: '[plenoMostrarErros]'
})
export class MostrarErrosDirective implements AfterViewInit, OnDestroy {
  @Input() plenoMostrarErros = '';
  @Input() encapsulated?: boolean;
  @Input() insideLayer?: boolean;
  @Input() isMatField = false;
  private parent: any;
  private input: any;
  private changes?: Subscription;
  private proximoCampo?: Subscription;
  private mostrarTodosErros$ = new BehaviorSubject(1);

  constructor (
    private element: ElementRef,
    private mostrarPrimeiroErro: MostrarPrimeiroErroDirective,
    @Optional() private ngControl: NgControl,
    private errosFormulario: ErrosFormularioService
  ) {
  }

  /**
   * Inicializa a lógica de exibição de erros após a visualização ser carregada, configurando eventos e manipuladores de erro.
   * @return Não retorna valor.
   */
  ngAfterViewInit () {
    if ( this.plenoMostrarErros === 'submit' ) {
      this.changes = fromEvent(this.element.nativeElement, 'click').subscribe(() => {
        this.mostrarPrimeiroErro.submit.emit();
      });
    } else {
      this.input = this.element.nativeElement;

      setTimeout(() => {
        if ( this.input && this.ngControl?.path?.length ) {
          this.input.id = this.ngControl.path.join('-');
        }
      }, 0);

      this.parent = $(this.element.nativeElement).parent();
      const isMatField = this.isMatField || (this.parent.parent().parent()[0] || null).classList?.contains('mat-form-field-wrapper');

      if ( isMatField )
        this.parent = this.parent.parent().parent();
      else if ( !this.insideLayer )
        this.parent = this.parent.parent();

      const focus$ = merge(
        of(false),
        fromEvent(this.input, 'focus').pipe(mapTo(true)),
        fromEvent(this.input, 'blur').pipe(mapTo(false)),
        fromEvent(this.input, 'returnPress').pipe(mapTo(false))
      );

      this.proximoCampo = fromEvent(this.input, 'returnPress').subscribe(() =>
        this.mostrarPrimeiroErro.irParaProximoCampo(this.input)
      );

      const status$ = merge(
        fromEvent(this.input, 'blur'),
        this.ngControl?.statusChanges ?? EMPTY,
        this.ngControl?.valueChanges ?? EMPTY,
        this.mostrarPrimeiroErro.submit.pipe(mapTo('submit')),
        this.mostrarTodosErros$
      );
      this.mostrarPrimeiroErro.registrarInput(this.input, this.ngControl);

      /* monitora mudanças de status do campo, caso exista algum erro,
       o erro é mostrado abaixo do campo */
      this.changes = combineLatest(focus$, status$).subscribe(([ focus, status ]) => {
        if ( this.ngControl?.errors && (!focus || status === 'submit') ) {
          const erro = this.obterDivErro(this.errosFormulario.formatObjToMsg(this.ngControl?.errors));

          if ( !this.parent.find('.pleno-erro').length ) {
            this.parent.append(erro);
            this.element.nativeElement.classList.add('is-invalid');
            this.parent[0].classList.add('has-danger');
            this.parent.parent()[0]?.classList?.add('ng-invalid', 'ng-star-inserted', 'mat-form-field-invalid', 'ng-touched', 'ng-dirty');
          }
        } else {
          this.parent.find('.pleno-erro').remove();
          this.element.nativeElement.classList.remove('is-invalid');
          this.parent[0].classList.remove('has-danger');
          this.parent.parent()[0].classList.remove('ng-invalid', 'ng-star-inserted', 'mat-form-field-invalid', 'ng-touched', 'ng-dirty');
        }
      });
    }
  }

  /**
   * Cria e retorna um elemento HTML de erro formatado com a mensagem fornecida.
   * @param msg Mensagem de erro a ser exibida.
   * @return String contendo o HTML do elemento de erro formatado.
   */
  obterDivErro (msg: string) {
    return `<span class="d-block pleno-erro invalid-feedback ml-1 ${this.isMatField ? 'mt-1' : ''}">${msg}</span>`;
  }

  /**
   * Limpa assinaturas de eventos ao destruir a diretiva para evitar vazamentos de memória.
   * @return Não retorna valor.
   */
  ngOnDestroy () {
    if ( this.changes instanceof Subscription ) {
      this.changes.unsubscribe();
    }

    if ( this.proximoCampo instanceof Subscription ) {
      this.proximoCampo.unsubscribe();
    }
  }

  /**
   * Incrementa o contador de exibição de todos os erros, acionando a atualização dos erros mostrados.
   * @return Não retorna valor.
   */
  public mostrarTodosErros () {
    const next = this.mostrarTodosErros$.value + 1;
    this.mostrarTodosErros$.next(next);
  }
}
