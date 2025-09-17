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
import { ConversaInterface, OptionRespostaSolicitacaoInterface, PerguntaRespostaInterface, PerguntaSolicitacaoInterface } from '../../common/types';
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
  protected listaPerguntasRespostas: PerguntaRespostaInterface[] = [];
  protected conversaIa: ConversaInterface[] = [];
  protected finalizado: boolean = false;
  protected solicitacaoFinalizada: boolean = false;
  protected perguntaSelecionada: PerguntaSolicitacaoInterface | null = null;
  protected digitando = false;
  protected readonly UtilsService = UtilsService;
  private listaPerguntas: PerguntaSolicitacaoInterface[] = [];
  private jaIniciou = false;
  @ViewChild('scrollContainer') private conversaContainer!: ElementRef;
  private thread_id: string = '';

  constructor (
    private cd: ChangeDetectorRef,
    private backend: BackendService,
    private dialog: MatDialog,
    protected authService: AuthService,
    private ngZone: NgZone,
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
   * Finaliza o agendamento de uma vistoria, enviando os dados necessários para o backend e atualizando o estado da aplicação.
   * @return {Promise<void>} Promessa que resolve quando a operação é concluída.
   */
  protected async finalizarAgendamento (): Promise<void> {
    UtilsService.carregando(true);

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
    }>('solicitacao/chat/v2/store', params);
    if ( response ) {
      this.solicitacaoFinalizada = true;
      UtilsService.notifySuccess('Sua solicitação de vistoria foi agendada com sucesso.', 'Agendado!');
      this.thread_id = '';
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

    // this.perguntaSelecionada = {
    //   pergunta: 'Olá, poderia me informar o tipo de vistoria que deseja agendar?',
    //   tipo_input: 'DATETIME',
    //   obrigatorio: 1,
    //   options: [],
    //   campo: 'tip_vis_codigo',
    //   valor: 26,
    //   sub_perguntas: [],
    //   desc_valor: 'Saída'
    // };

    UtilsService.carregando(false);
    this.digitando = false;
    setTimeout(() => this.rolarParaBaixo());
  }

  /**
   * Processa a resposta recebida e atualiza a interface do usuário.
   * @param {string | { valor: string | OptionRespostaSolicitacaoInterface | number; extra?: string }} event - Dados recebidos que podem ser uma string ou um objeto com descrição e valor.
   * @return {Promise<void>} Promessa que resolve quando a operação é concluída.
   */
  protected async recebeResposta (event: { valor: string | OptionRespostaSolicitacaoInterface | number; extra?: string }): Promise<void> {
    console.log(event);
    const { valor, message } = this.extrairResposta(event);
    console.log(valor, message);

    if ( message ) {
      const conversa = this.criarConversa(message, this.perguntaSelecionada?.pergunta || '');
      this.conversaIa.push(conversa);
      this.digitando = true;
      this.rolarDepois(400);
      this.rolarDepois(400);
    }

    if ( this.perguntaSelecionada ) {
      this.perguntaSelecionada.valor = valor;
      this.perguntaSelecionada.desc_valor = message;
      this.rolarDepois(400);
      this.perguntaSelecionada = this.getProximaPergunta(this.perguntaSelecionada);
      this.rolarDepois();
    }

    if ( !this.perguntaSelecionada ) {
      if ( this.jaIniciou ) {
        this.digitando = false;
        this.mostrarConfirmacaoFinal();
      } else {
        this.jaIniciou = true;
        await this.enviaRoteiro();
        this.rolarDepois();
      }
    }

    setTimeout(() => {
      this.digitando = false;
      this.rolarDepois();
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
   * Exibe a confirmação final das respostas coletadas e atualiza a interface do usuário.
   * @returns {void}
   */
  private mostrarConfirmacaoFinal (): void {
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
   * Rola a visualização para baixo após um atraso especificado.
   * @param delay Tempo em milissegundos antes de rolar a visualização. Padrão é 100.
   */
  private rolarDepois (delay = 100): void {
    setTimeout(() => this.rolarParaBaixo(), delay);
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
    const tipo = event.tipo === 'DATE' ||
      event.tipo === 'DATETIME' ||
      event.tipo === 'CEP' ||
      event.tipo === 'TEL' ||
      event.tipo === 'TEXT' ||
      event.tipo === 'INTEGER';
    if ( tipo ) {
      return { valor: event.valor, message: event.valor };
    }
    if ( event.tipo === 'SELECT' ) {
      return { valor: event.valor.label_value, message: event.valor.label_desc };
    }
    if ( event.tipo === 'FLOAT' ) {
      return { valor: event.valor, message: this.currencyPipe.transform(event.valor, 'BRL', '', '1.2-2', 'pt-BR') };
    }
    if ( event.tipo === 'CURRENCY' ) {
      return { valor: event.valor, message: this.currencyPipe.transform(event.valor, 'BRL', 'symbol', '1.2-2', 'pt-BR') };
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
      const filhoValido = atual.sub_perguntas.find(sub => this.verificaCondicao(sub, atual.valor));
      if ( filhoValido ) return filhoValido;
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
   * Lida com erros ao gerar resposta da IA e atualiza a interface do usuário.
   * @param index Índice da pergunta/resposta na lista.
   * @param dado Dados enviados que causaram o erro.
   * @param tipoDado Tipo de dado enviado ('audio', 'mensagem' ou 'arquivo').
   * @param error Objeto de erro capturado.
   */
  private tratarErroRespostaConversaIA (index: number, dado: any, tipoDado: 'audio' | 'mensagem' | 'arquivo', error: any): void {
    console.error(error);
    const timeIA = moment().format('HH:mm:ss DD/MM/YY');
    this.listaPerguntasRespostas[index].iaMessage = {
      message: `Ocorreu um erro ao gerar a resposta.`,
      time: timeIA,
      index,
      regen: true,
      dado,
      tipoDado
    };
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
  private rolarParaBaixo (): void {
    setTimeout(() => {
      const container = this.conversaContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      this.cd.detectChanges();
    }, 0);
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