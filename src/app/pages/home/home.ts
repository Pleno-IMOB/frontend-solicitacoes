import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AnexoInterface, CepResponseApi, ConversaInterface, OptionRespostaSolicitacaoInterface, PerguntaSolicitacaoInterface } from '../../common/types';
import moment from 'moment';
import { BackendService } from '../../services/backend.service';
import { Login } from '../login/login';
import { firstValueFrom } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { MeusDados } from '../meus-dados/meus-dados';
import { PerguntaSolicitacao } from '../../components/pergunta-solicitacao/pergunta-solicitacao';
import { UserMessage } from '../../components/user-message/user-message';
import { IaMessage } from '../../components/ia-message/ia-message';
import { MessageLoading } from '../../components/message-loading/message-loading';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    Header,
    Footer,
    MatDividerModule,
    FontAwesomeModule,
    MatDialogModule,
    PerguntaSolicitacao,
    UserMessage,
    IaMessage,
    MessageLoading,
    MatProgressSpinner
  ],
  templateUrl: './home.html',
  standalone: true,
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  protected conversaIa: ConversaInterface[] = [];
  protected finalizado: boolean = false;
  protected solicitacaoFinalizada: boolean = false;
  protected perguntaSelecionada: PerguntaSolicitacaoInterface | null = null;
  protected digitando = false;
  protected readonly UtilsService = UtilsService;
  private listaPerguntas: PerguntaSolicitacaoInterface[] = [];
  private verificarAgendamento = true;
  private jaIniciou = false;
  @ViewChild('scrollContainer') private conversaContainer!: ElementRef;
  private thread_id: string = '';
  private cepAliasMap: Record<string, string[]> = {
    logradouro: [ 'imo_endereco', 'pes_endereco' ]
  };

  constructor (
    private cd: ChangeDetectorRef,
    private backend: BackendService,
    private dialog: MatDialog,
    protected authService: AuthService,
    private ngZone: NgZone,
    private toaster: ToastrService,
    private currencyPipe: CurrencyPipe
  ) {
  }

  /**
   * Inicializa o componente, interceptando mudanças de rota e iniciando a conversa com a IA.
   * @return Promise que resolve quando a operação é concluída.
   */
  async ngOnInit (): Promise<void> {
    this.interceptarMudancaDeRota();
    await this.iniciaConversaIA();
  }

  /**
   * Executa um callback após remover a última mensagem da conversa e definir o estado de digitação.
   * @param {any} callback Função de callback a ser executada.
   * @return Retorna o resultado da execução do callback.
   */
  public async callbackError (callback: any) {
    this.conversaIa?.pop();
    this.digitando = true;
    return callback();
  }

  /**
   * Finaliza o agendamento de uma vistoria, enviando os dados necessários para o backend e atualizando o estado da aplicação.
   * @return {Promise<void>} Promessa que resolve quando a operação é concluída.
   */
  protected async finalizarAgendamento (): Promise<void> {
    while ( !this.authService.pessoa.value?.pes_codigo || !this.authService.pessoa.value?.cli_codigo ) {
      await this.login();
    }

    const params: any = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      cli_codigo: this.authService.pessoa.value?.cli_codigo,
      pes_codigo: this.authService.pessoa.value?.pes_codigo,
      roteiro: this.listaPerguntas
    };

    UtilsService.carregando(true);

    let response: any = await this.backend.apiPost<{
      roteiro: PerguntaSolicitacaoInterface[],
      thread_id: string;
    }>('solicitacao/chat/v2/store', params);
    if ( response ) {
      this.solicitacaoFinalizada = true;
      UtilsService.notifySuccess('Sua solicitação de vistoria foi agendada com sucesso.', 'Agendado!');
      this.thread_id = '';
      if ( response.mensagem ) {
        Swal.fire({
          icon: 'success',
          html: response.mensagem,
          cancelButtonText: 'Ok',
          cancelButtonColor: '#3085d6'
        }).then();
      }
    }

    UtilsService.carregando(false);
    setTimeout(() => this.rolarParaBaixo());
  }

  /**
   * Inicia uma nova conversa com a IA, enviando uma solicitação ao backend e atualizando a interface do usuário.
   * @return Promise que resolve quando a operação é concluída.
   */
  protected async iniciaConversaIA (): Promise<void> {
    UtilsService.carregando(true);
    this.digitando = true;

    const params: any = {
      host: this.backend.urlSistema
    };

    let response = await this.backend.apiPost<{
      roteiro: PerguntaSolicitacaoInterface[],
      thread_id: string;
    }>('solicitacao/chat/v2/solicitar', params);
    if ( response ) {
      this.listaPerguntas = response.roteiro;
      this.perguntaSelecionada = this.getPrimeiraPerguntaValida();
      this.thread_id = response.thread_id;
    }

    UtilsService.carregando(false);
    this.digitando = false;
    setTimeout(() => this.rolarParaBaixo());
  }

  /**
   * Processa a resposta recebida e atualiza a interface do usuário.
   * @param {string | { valor: string | OptionRespostaSolicitacaoInterface | number; extra?: string }} event - Dados recebidos que podem ser uma string ou um objeto com descrição e valor.
   * @return {Promise<void>} Promessa que resolve quando a operação é concluída.
   */
  protected async recebeResposta (event: { valor: string | OptionRespostaSolicitacaoInterface | number | AnexoInterface[]; tipo?: string }): Promise<void> {
    const { valor, message } = this.extrairResposta(event);
    if ( event.tipo === 'CEP' ) {
      this.UtilsService.carregando(true);
      const continuarFuncao = await this.buscaCep(event);
      this.UtilsService.carregando(false);
      if ( !continuarFuncao ) {
        return;
      }
    }

    if ( message ) {
      const conversa = this.criarConversa(message, this.perguntaSelecionada?.pergunta || '');
      this.conversaIa.push(conversa);
      this.digitando = true;
      this.rolarParaBaixo(400);
    }

    if ( this.perguntaSelecionada ) {
      this.perguntaSelecionada.valor = valor;
      this.perguntaSelecionada.desc_valor = message;
      this.rolarParaBaixo(400);
      this.perguntaSelecionada = this.getProximaPergunta(this.perguntaSelecionada);
      this.rolarParaBaixo();
    }

    if ( !this.perguntaSelecionada ) {
      if ( this.jaIniciou ) {
        this.digitando = false;
        await this.mostrarConfirmacaoFinal();
      } else {
        this.jaIniciou = true;
        await this.enviaRoteiro();
        this.rolarParaBaixo();
      }
    }

    setTimeout(() => {
      this.digitando = false;
      this.rolarParaBaixo();
    }, 800);

    this.cd.detectChanges();
  }

  /**
   * Realiza o processo de login exibindo um diálogo e redirecionando após sucesso.
   * @return Promessa que resolve quando o login é concluído.
   */
  protected async meusDados (): Promise<void> {
    const dialog: MatDialogRef<MeusDados, any> = this.dialog.open(MeusDados, {
      data: {},
      width: '80vw',
      maxWidth: '500px',
      maxHeight: '90vh',
      minWidth: '340px',
      height: 'auto',
      panelClass: 'meus-dados-dialog'
    });

    const result = await firstValueFrom(dialog.afterClosed());
    if ( result ) {
      if ( this.authService.pessoa.value?.pes_codigo && this.authService.pessoa.value?.cli_codigo ) {
        UtilsService.notifySuccess('', 'Dados salvos com sucesso!');
      }
    }

    window.history.pushState({}, '', ('/agendamento'));
  }

  /**
   * Busca informações de endereço com base no CEP fornecido e preenche as subperguntas correspondentes.
   * @param {any} event - Objeto contendo o valor do CEP a ser buscado.
   * @returns {Promise<boolean>} Retorna uma promessa que resolve para true se o CEP for encontrado e processado corretamente, caso contrário, false.
   */
  protected async buscaCep (event: any): Promise<boolean> {
    const response: CepResponseApi = await this.backend.apiGetExternal(`https://api.sistemaspleno.com/api/vistoria/v2/address?cep=${event.valor}`, null, () => this.tratarCepErro());

    if ( response && this.perguntaSelecionada && this.perguntaSelecionada?.tipo_input === 'CEP' ) {
      this.preencherSubperguntasComCep(this.perguntaSelecionada.sub_perguntas, response);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Realiza o processo de login exibindo um diálogo e redirecionando após sucesso.
   * @return Promessa que resolve quando o login é concluído.
   */
  protected async login (): Promise<void> {
    const dialog: MatDialogRef<Login, any> = this.dialog.open(Login, {
      data: {},
      width: '80vw',
      maxWidth: '500px',
      maxHeight: '90vh',
      minWidth: '340px',
      height: 'auto',
      panelClass: 'login-dialog'
    });

    const result = await firstValueFrom(dialog.afterClosed());
    if ( result ) {
      if ( this.authService.pessoa.value?.pes_codigo && this.authService.pessoa.value?.cli_codigo ) {
        UtilsService.notifySuccess('', 'Login efetuado com sucesso!');
      }
    }

    window.history.pushState({}, '', ('/agendamento'));
  }

  /**
   * Reinicia a aplicação recarregando a página atual.
   */
  protected iniciarNovaSolicitacao (): void {
    setTimeout((): void => window.location.reload(), 800);
  }

  /**
   * Trata o erro ao buscar um CEP, resetando valores e exibindo uma mensagem de erro.
   */
  private tratarCepErro (): void {
    if ( this.perguntaSelecionada ) {
      this.perguntaSelecionada.valor = null;
      this.perguntaSelecionada.desc_valor = null;
    }

    this.digitando = false;
    this.toaster.error('Nenhum endereço encontrado. Verifique os dados informados.', 'Oops!');
  }

  /**
   * Preenche as subperguntas com os dados do CEP fornecido.
   * @param subPerguntas Lista de subperguntas a serem preenchidas.
   * @param dadosCep Dados do CEP utilizados para preencher as subperguntas.
   */
  private preencherSubperguntasComCep (
    subPerguntas: PerguntaSolicitacaoInterface[],
    dadosCep: any
  ): void {
    for ( const p of subPerguntas ) {
      const campoFinal = p.campo.split('.').pop();

      let apiKey: string | null = null;
      for ( const key in this.cepAliasMap ) {
        if ( this.cepAliasMap[key].includes(campoFinal || '') ) {
          apiKey = key;
          break;
        }
      }

      if ( !apiKey && campoFinal && dadosCep.hasOwnProperty(campoFinal) ) {
        apiKey = campoFinal;
      }

      if ( apiKey && dadosCep.hasOwnProperty(apiKey) ) {
        const valor = dadosCep[apiKey];

        if ( valor !== null && valor !== undefined && valor !== '' ) {
          p.valor = valor;
          p.desc_valor = valor;
        } else {
          p.valor = null;
          p.desc_valor = null;
        }
      }

      if ( p.sub_perguntas && p.sub_perguntas.length > 0 ) {
        this.preencherSubperguntasComCep(p.sub_perguntas, dadosCep);
      }
    }
  }

  /**
   * Exibe a confirmação final das respostas coletadas e atualiza a interface do usuário.
   * @returns {void}
   */
  private async mostrarConfirmacaoFinal (): Promise<void> {
    if ( !(await this.validarAgendamento()) ) {
      return;
    }

    const resumo = this.coletarRespostas(this.listaPerguntas);
    const confirmacao = this.criarConversa(
      '',
      this.montarMensagemConfirmacao(resumo)
    );

    this.conversaIa.push(confirmacao);

    setTimeout(() => {
      this.finalizado = true;
      this.rolarParaBaixo();
      this.cd.detectChanges();
    }, 200);
  }

  /**
   * Valida o agendamento atual verificando as condições necessárias e atualizando o estado da aplicação.
   * @returns {Promise<boolean>} Retorna uma promessa que resolve para true se o agendamento for válido, caso contrário, false.
   */
  private async validarAgendamento (): Promise<boolean> {
    if ( !this.verificarAgendamento ) {
      return true;
    }

    this.digitando = true;
    this.rolarParaBaixo();

    const params: any = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      cli_codigo: this.authService.pessoa.value?.cli_codigo,
      pes_codigo: this.authService.pessoa.value?.pes_codigo,
      roteiro: this.listaPerguntas
    };

    const roteiro = await this.backend.apiPost<{
      roteiro: PerguntaSolicitacaoInterface[],
      thread_id: string;
    }>(`solicitacao/chat/v2/verificarAgendamento`, params, () => null).catch(() => null);
    this.digitando = false;

    if ( !roteiro ) {
      this.conversaIa.push({
        iaMessage: {
          message: 'Não foi possível processar a requisição!',
          time: moment().format('HH:mm:ss DD/MM/YY'),
          error: {
            callback: () => this.callbackError(this.validarAgendamento.bind(this))
          }
        }
      } as ConversaInterface);

      return false;
    }

    if ( roteiro?.roteiro?.length !== this.listaPerguntas?.length ) {
      const currentIdx = this.listaPerguntas.length;
      this.listaPerguntas = roteiro.roteiro;
      this.perguntaSelecionada = this.listaPerguntas.find((item, idx) => idx >= currentIdx && !item.valor) || null;
      this.verificarAgendamento = false;

      if ( this.perguntaSelecionada?.campo ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cria um objeto de conversa com mensagens do usuário e da IA.
   * @param userMessage Mensagem enviada pelo usuário.
   * @param iaMessage Mensagem gerada pela IA.
   * @returns Objeto de interface de conversa contendo as mensagens e o horário atual.
   */
  private criarConversa (userMessage: string | number, iaMessage: string): ConversaInterface {
    const agora = moment().format('HH:mm:ss DD/MM/YY');
    const valor = typeof userMessage === 'string' ? userMessage : userMessage;
    return {
      userMessage: { time: agora, message: valor || '' },
      iaMessage: { time: agora, message: iaMessage }
    };
  }

  /**
   * Extrai a resposta de um dado fornecido, retornando o valor e a mensagem correspondente.
   * @param {{ valor: string | OptionRespostaSolicitacaoInterface | number; extra?: string }} event - Dados recebidos que podem ser uma string ou um objeto com descrição e valor.
   * @returns {{ valor: any, message: string }} Objeto contendo o valor extraído e a mensagem.
   */
  private extrairResposta (event: { valor: any; tipo?: string }): { valor: any, message: any } {
    const tipo = event.tipo === 'TEL' ||
      event.tipo === 'TEXT' ||
      event.tipo === 'INTEGER' ||
      event.tipo === 'CEP' ||
      event.tipo === 'PULAR';
    if ( tipo ) {
      return { valor: event.valor, message: event.valor };
    }
    if ( event.tipo === 'SELECT' || event.tipo === 'DATE' || event.tipo === 'DATETIME' || event.tipo === 'TIME' ) {
      return { valor: event.valor.label_value, message: event.valor.label_desc };
    }
    if ( event.tipo === 'FLOAT' ) {
      return { valor: event.valor, message: this.currencyPipe.transform(event.valor, 'BRL', '', '1.2-2', 'pt-BR') };
    }
    if ( event.tipo === 'CURRENCY' ) {
      return { valor: event.valor, message: this.currencyPipe.transform(event.valor, 'BRL', 'symbol', '1.2-2', 'pt-BR') };
    }
    if ( event.tipo === 'FILE' ) {
      const listaAnexos = event.valor.map((anexo: AnexoInterface) => anexo.base64);
      return { valor: listaAnexos, message: `${listaAnexos.length} ${listaAnexos.length > 1 ? 'anexos inseridos.' : 'anexo inserido.'}` };
    }
    return { valor: null, message: '' };
  }

  /**
   * Envia o roteiro atual para o backend e atualiza a interface do usuário.
   * @return {Promise<void>} Promessa que resolve quando a operação é concluída.
   * @description
   * - host: URL do sistema backend.
   * - thread_id: Identificador da conversa atual.
   * - cli_codigo: Código do cliente autenticado.
   * - pes_codigo: Código da pessoa autenticada.
   * - roteiro: Lista de perguntas a serem enviadas.
   */
  private async enviaRoteiro (): Promise<void> {
    UtilsService.carregando(true);
    this.digitando = true;

    const params: any = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      cli_codigo: this.authService.pessoa.value?.cli_codigo,
      pes_codigo: this.authService.pessoa.value?.pes_codigo,
      roteiro: this.listaPerguntas
    };

    let response = await this.backend.apiPost<{
      roteiro: PerguntaSolicitacaoInterface[],
      thread_id: string;
    }>('solicitacao/chat/v2/solicitar', params);
    if ( response ) {
      this.listaPerguntas = response.roteiro;
      this.perguntaSelecionada = this.getPrimeiraPerguntaValida();
      this.thread_id = response.thread_id;
    }

    UtilsService.carregando(false);
    this.digitando = false;
    setTimeout((): void => this.rolarParaBaixo());
  }

  /**
   * Monta uma mensagem de confirmação com as respostas fornecidas.
   * @param respostas - Lista de objetos contendo a pergunta e a resposta associada.
   * @returns Uma string formatada com a confirmação dos dados.
   */
  private montarMensagemConfirmacao (respostas: { pergunta: string; resposta: any }[]): string {
    return (
      '✅ Confirmação dos dados:\n\n' +
      respostas
        .map((r: any, index) => `<b>${index + 1}.</b> ${r.pergunta} \n<b>R.</b> ${r.resposta}`)
        .join('\n\n')
    );
  }

  /**
   * Retorna a primeira pergunta válida da lista de perguntas.
   * @returns A primeira pergunta que atende à condição ou null se nenhuma for encontrada.
   */
  private getPrimeiraPerguntaValida (): PerguntaSolicitacaoInterface | null {
    for ( const pergunta of this.listaPerguntas ) {
      if ( this.verificaCondicao(pergunta, null) ) {
        return pergunta;
      }
    }
    return null;
  }

  /**
   * Obtém o próximo irmão de uma pergunta na lista de perguntas.
   * @param alvo Pergunta atual para a qual se deseja encontrar o próximo irmão.
   * @returns O próximo irmão da pergunta ou null se não houver.
   */
  private getProximoIrmao (alvo: PerguntaSolicitacaoInterface): PerguntaSolicitacaoInterface | null {
    const pai = this.getPai(alvo, this.listaPerguntas);
    const lista = pai ? pai.sub_perguntas : this.listaPerguntas;
    const idx = lista.indexOf(alvo);
    return idx >= 0 && idx < lista.length - 1 ? lista[idx + 1] : null;
  }

  /**
   * Retorna o pai de uma pergunta alvo dentro de uma lista de perguntas.
   * @param alvo Pergunta que se deseja encontrar o pai.
   * @param lista Lista de perguntas onde a busca será realizada.
   * @returns O pai da pergunta alvo ou null se não for encontrado.
   */
  private getPai (alvo: PerguntaSolicitacaoInterface, lista: PerguntaSolicitacaoInterface[]): PerguntaSolicitacaoInterface | null {
    for ( const item of lista ) {
      if ( item.sub_perguntas.includes(alvo) ) {
        return item;
      }
      const pai = this.getPai(alvo, item.sub_perguntas);
      if ( pai ) return pai;
    }
    return null;
  }

  /**
   * Obtém a próxima pergunta válida na sequência de perguntas.
   * @param atual PerguntaSolicitacaoInterface - A pergunta atual para a qual se deseja encontrar a próxima.
   * @returns PerguntaSolicitacaoInterface | null - Retorna a próxima pergunta válida ou null se não houver.
   */
  private getProximaPergunta (atual: PerguntaSolicitacaoInterface): PerguntaSolicitacaoInterface | null {
    if ( atual.sub_perguntas && atual.sub_perguntas.length > 0 ) {
      for ( const filho of atual.sub_perguntas ) {
        if ( this.verificaCondicao(filho, atual.valor) ) {
          return filho;
        }
        const neto = this.getProximaPergunta(filho);
        if ( neto ) return neto;
      }
    }

    let proximoIrmao = this.getProximoIrmao(atual);
    while ( proximoIrmao ) {
      const pai = this.getPai(proximoIrmao, this.listaPerguntas);
      if ( this.verificaCondicao(proximoIrmao, pai?.valor) ) {
        return proximoIrmao;
      }
      proximoIrmao = this.getProximoIrmao(proximoIrmao);
    }

    let pai = this.getPai(atual, this.listaPerguntas);
    while ( pai ) {
      let irmaoDoPai = this.getProximoIrmao(pai);
      while ( irmaoDoPai ) {
        const paiIrmao = this.getPai(irmaoDoPai, this.listaPerguntas);
        if ( this.verificaCondicao(irmaoDoPai, paiIrmao?.valor) ) {
          return irmaoDoPai;
        }
        irmaoDoPai = this.getProximoIrmao(irmaoDoPai);
      }
      pai = this.getPai(pai, this.listaPerguntas);
    }

    return null;
  }

  /**
   * Verifica se uma pergunta deve ser exibida com base em suas condições de exibição.
   * @param pergunta PerguntaSolicitacaoInterface - Objeto que representa a pergunta a ser verificada.
   * @param valorPai any - Valor do pai usado para verificar as condições de exibição.
   * @returns boolean - Retorna true se a pergunta deve ser exibida, caso contrário, false.
   */
  private verificaCondicao (pergunta: PerguntaSolicitacaoInterface, valorPai: any): boolean {
    if ( pergunta.valor !== null && pergunta.valor !== undefined && pergunta.valor !== '' ) {
      return false;
    }

    if ( !pergunta.condicao_exibicao || pergunta.condicao_exibicao.length === 0 ) {
      return true;
    }

    if ( pergunta.condicao_exibicao[0] === true && valorPai ) {
      return true;
    }

    return pergunta.condicao_exibicao.includes(valorPai);
  }

  /**
   * Intercepta mudanças de rota e executa ações específicas com base na nova URL.
   * @private
   */
  private interceptarMudancaDeRota (): void {
    const originalPushState = window.history.pushState;
    const self = this;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      const url = args[2] as string;

      if ( url === '/login' || url === '/agendamento/login' ) {
        self.ngZone.run(() => {
          self.login().then();
        });
      }

      if ( url === '/meus-dados' || url === '/agendamento/meus-dados' ) {
        self.ngZone.run(() => {
          self.meusDados().then();
        });
      }
    };
  }

  /**
   * Rola a visualização para o final do container de conversa.
   * @return Não retorna valor.
   */
  private rolarParaBaixo (delay: number = 0): void {
    setTimeout(() => {
      const container = this.conversaContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      this.cd.detectChanges();
    }, delay);
  }

  /**
   * Coleta as respostas das perguntas fornecidas.
   * @param perguntas Lista de perguntas a serem processadas.
   * @returns Array de objetos contendo a pergunta e a resposta associada.
   */
  private coletarRespostas (perguntas: PerguntaSolicitacaoInterface[]): { pergunta: string; resposta: any }[] {
    let respostas: { pergunta: string; resposta: any }[] = [];

    for ( const p of perguntas ) {
      if ( p.desc_valor !== undefined && p.desc_valor !== null && p.desc_valor !== '' ) {
        respostas.push({
          pergunta: p.pergunta,
          resposta: p.desc_valor
        });
      }

      if ( p.sub_perguntas && p.sub_perguntas.length > 0 ) {
        respostas = respostas.concat(this.coletarRespostas(p.sub_perguntas));
      }
    }

    return respostas;
  }
}