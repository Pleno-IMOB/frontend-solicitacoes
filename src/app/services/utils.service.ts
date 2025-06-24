import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SweetAlertOptions } from 'sweetalert2';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public static toastr: ToastrService;
  private static loadingGeral$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private static loadingGeralMsg$: BehaviorSubject<string> = new BehaviorSubject<string>('Carregando');
  private static loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private static erro$: BehaviorSubject<SweetAlertOptions | null> = new BehaviorSubject<SweetAlertOptions | null>(null);

  constructor () {
  }

  /**
   * Obtém o estado de carregamento geral.
   * @return Observable que emite o estado de carregamento geral.
   */
  static get loadingGeral (): BehaviorSubject<boolean> {
    return UtilsService.loadingGeral$;
  }

  /**
   * Obtém a mensagem de carregamento geral.
   * @return Observable que emite a mensagem de carregamento geral.
   */
  static get loadingGeralMsg (): BehaviorSubject<string> {
    return UtilsService.loadingGeralMsg$;
  }

  /**
   * Obtém o estado de carregamento específico.
   * @return Observable que emite o estado de carregamento.
   */
  static get loading (): BehaviorSubject<boolean> {
    return UtilsService.loading$;
  }

  /**
   * Obtém o observable de erros.
   * @return Observable que emite informações de erro.
   */
  static get erro (): Observable<SweetAlertOptions | null> {
    return UtilsService.erro$.asObservable();
  }

  /**
   * Atualiza o estado de carregamento geral e define a mensagem de carregamento.
   * @param carregando Indica se o carregamento está ativo.
   * @param msg Mensagem a ser exibida durante o carregamento.
   * @return Não retorna valor.
   */
  static carregandoGeral (carregando: boolean, msg = 'Carregando ...'): void {
    if ( carregando )
      document.body.style.cursor = 'progress';
    else
      document.body.style.cursor = '';

    UtilsService.loadingGeralMsg$.next(msg);
    UtilsService.loadingGeral$.next(carregando);
  }

  /**
   * Atualiza o estado de carregamento específico.
   * @param carregando Indica se o carregamento está ativo.
   * @return Não retorna valor.
   */
  static carregando (carregando: boolean) {
    UtilsService.loading$.next(carregando);
  }

  /**
   * Exibe um erro utilizando as opções do SweetAlert.
   * @param erro Opções de configuração do SweetAlert para exibir o erro.
   * @return Não retorna valor.
   */
  static mostrarErro (erro: SweetAlertOptions): void {
    UtilsService.erro$.next(erro);
  }

  /**
   * Limpa o erro atualmente exibido.
   * @return Não retorna valor.
   */
  static limparErro (): void {
    UtilsService.erro$.next(null);
  }

  /**
   * Exibe uma notificação de sucesso com a mensagem e título fornecidos, utilizando configurações opcionais.
   * @param {string} message - Mensagem a ser exibida na notificação.
   * @param {string} [title] - Título opcional da notificação.
   * @param {Partial<IndividualConfig>} [config] - Configurações adicionais para personalizar a notificação.
   * @return {void}
   */
  public static notifySuccess (message: string, title?: string, config?: Partial<IndividualConfig>): void {
    UtilsService.carregandoGeral(false);
    const options: Partial<IndividualConfig> = {
      positionClass: 'toast-bottom-center',
      progressBar: true,
      timeOut: 3000,
      closeButton: true,
      ...config
    };
    UtilsService.toastr?.success(message, title, options);
  }
}
