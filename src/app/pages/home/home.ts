import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConversaInterface, PerguntaRespostaInterface, PerguntaSolicitacaoInterface } from '../../common/types';
import moment from 'moment';
import { BackendService } from '../../services/backend.service';
import { Login } from '../login/login';
import { firstValueFrom } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { MeusDados } from '../meus-dados/meus-dados';
import { PerguntaSolicitacao } from '../../components/pergunta-solicitacao/pergunta-solicitacao';
import { IaMessage2 } from '../../components/ia-message-2/ia-message-2';
import { UserMessage2 } from '../../components/user-message-2/user-message-2';
import { IaMessageLoading } from '../../components/ia-message-loading/ia-message-loading';

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
    IaMessage2,
    UserMessage2,
    IaMessageLoading
  ],
  templateUrl: './home.html',
  standalone: true,
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  protected listaPerguntasRespostas: PerguntaRespostaInterface[] = [];
  protected conversaIa: ConversaInterface[] = [];
  protected index: number = 0;
  protected finalizado: boolean = false;
  protected payload!: any;
  protected solicitacaoFinalizada: boolean = false;
  protected perguntaSelecionada: PerguntaSolicitacaoInterface | null = null;
  protected digitando = false;
  protected mockListaPerguntas: PerguntaSolicitacaoInterface[] = [];
  protected roteiroFinalizado = false;

  @ViewChild('scrollContainer') private conversaContainer!: ElementRef;
  private thread_id: string = '';

  constructor (
    private cd: ChangeDetectorRef,
    private backend: BackendService,
    private dialog: MatDialog,
    protected authService: AuthService,
    private ngZone: NgZone
  ) {
  }

  async ngOnInit (): Promise<void> {
    this.interceptarMudancaDeRota();
    await this.enviaPerguntaResposta();
  }

  protected async enviaPerguntaResposta (roteiroFinalizado: boolean = false): Promise<void> {
    UtilsService.carregando(true);
    this.digitando = true;

    const params: any = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      cli_codigo: this.authService.pessoa.value?.cli_codigo,
      pes_codigo: this.authService.pessoa.value?.pes_codigo,
      roteiro: this.mockListaPerguntas
    };

    if ( roteiroFinalizado ) {
      let response = await this.backend.apiPost<{
        roteiro: PerguntaSolicitacaoInterface[],
        thread_id: string;
      }>('solicitacao/chat/v2/store', params);
      if ( response ) {
        console.log(response);
        // this.mockListaPerguntas = response.roteiro;
        // this.perguntaSelecionada = this.mockListaPerguntas[0];
        // this.thread_id = response.thread_id;
        UtilsService.carregando(false);
      }

      this.rolarParaBaixo();
    } else {
      let response = await this.backend.apiPost<{
        roteiro: PerguntaSolicitacaoInterface[],
        thread_id: string;
      }>('solicitacao/chat/v2/solicitar', params);
      if ( response ) {
        this.mockListaPerguntas = response.roteiro;
        this.perguntaSelecionada = this.getPrimeiraPerguntaValida();
        this.thread_id = response.thread_id;
        UtilsService.carregando(false);
      }

      this.rolarParaBaixo();
    }
    this.digitando = false;
  }

  /**
   * Recebe uma mensagem e a envia ao backend.
   * @param dado - Mensagem recebida como string.
   * @return Promessa que resolve quando a operação é concluída.
   */
  protected async recebeResposta (dado: string | { label_desc: string; label_value: any }): Promise<void> {
    let message = '';
    let valor;
    if ( dado ) {
      if ( typeof dado === 'string' ) {
        valor = dado;
        message = dado;
      } else {
        valor = dado.label_value;
        message = dado.label_desc;
      }
    }

    const conversa: ConversaInterface = {
      index: this.index,
      userMessage: { time: moment().format('HH:mm:ss DD/MM/YY'), message },
      iaMessage: { time: moment().format('HH:mm:ss DD/MM/YY'), message: this.perguntaSelecionada?.pergunta || '' }
    };

    if ( message ) {
      this.conversaIa.push(conversa);
    }

    setTimeout(() => {
      this.rolarParaBaixo();
    }, 300);

    if ( this.perguntaSelecionada ) {
      this.perguntaSelecionada.valor = valor;
      this.perguntaSelecionada = this.getProximaPergunta(this.perguntaSelecionada);
    }

    if ( !this.perguntaSelecionada ) {
      console.log('🚀 Fluxo finalizado!');
      await this.enviaPerguntaResposta(this.roteiroFinalizado);
      this.roteiroFinalizado = true;
    }

    this.cd.detectChanges();
    this.rolarParaBaixo();
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
        // await this.enviaPerguntaResposta('O cliente e o usuário foram setados com sucesso.', 'mensagem');
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
        // await this.enviaPerguntaResposta('O cliente e o usuário foram setados com sucesso.', 'mensagem');
      }
    }

    window.history.pushState({}, '', ('/agendamento'));
  }

  /**
   * Finaliza o agendamento (implementação pendente).
   * @return Não retorna valor.
   */
  protected async finalizarAgendamento (): Promise<void> {
    UtilsService.carregandoGeral(true);
    this.payload = { ...this.payload };
    const response: any = await this.backend.apiPost('solicitacao/chat/store', this.payload);
    if ( response ) {
      this.solicitacaoFinalizada = true;
    }
    this.thread_id = '';
    UtilsService.carregandoGeral(false);
    UtilsService.notifySuccess('Sua solicitação de vistoria foi agendada com sucesso.', 'Agendado!');
  }

  /**
   * Reinicia a aplicação recarregando a página atual.
   */
  protected iniciarNovaSolicitacao (): void {
    setTimeout((): void => {
      window.location.reload();
    }, 1000);
  }

  private getPrimeiraPerguntaValida (): PerguntaSolicitacaoInterface | null {
    // percorre a lista inicial como se fosse a "raiz"
    for ( const pergunta of this.mockListaPerguntas ) {
      if ( this.verificaCondicao(pergunta, null) ) {
        return pergunta;
      }
    }
    return null;
  }

  private getProximoIrmao (alvo: PerguntaSolicitacaoInterface): PerguntaSolicitacaoInterface | null {
    const pai = this.getPai(alvo, this.mockListaPerguntas);
    const lista = pai ? pai.sub_perguntas : this.mockListaPerguntas;
    const idx = lista.indexOf(alvo);
    return idx >= 0 && idx < lista.length - 1 ? lista[idx + 1] : null;
  }

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

  private getProximaPergunta (atual: PerguntaSolicitacaoInterface): PerguntaSolicitacaoInterface | null {
    if ( atual.sub_perguntas && atual.sub_perguntas.length > 0 ) {
      const filhoValido = atual.sub_perguntas.find(sub => this.verificaCondicao(sub, atual.valor));
      if ( filhoValido ) return filhoValido;
    }

    let proximoIrmao = this.getProximoIrmao(atual);
    while ( proximoIrmao ) {
      const pai = this.getPai(proximoIrmao, this.mockListaPerguntas);
      if ( this.verificaCondicao(proximoIrmao, pai?.valor) ) {
        return proximoIrmao;
      }
      proximoIrmao = this.getProximoIrmao(proximoIrmao);
    }

    let pai = this.getPai(atual, this.mockListaPerguntas);
    while ( pai ) {
      let irmaoDoPai = this.getProximoIrmao(pai);
      while ( irmaoDoPai ) {
        const paiIrmao = this.getPai(irmaoDoPai, this.mockListaPerguntas);
        if ( this.verificaCondicao(irmaoDoPai, paiIrmao?.valor) ) {
          return irmaoDoPai;
        }
        irmaoDoPai = this.getProximoIrmao(irmaoDoPai);
      }
      pai = this.getPai(pai, this.mockListaPerguntas);
    }

    return null;
  }

  private verificaCondicao (pergunta: PerguntaSolicitacaoInterface, valorPai: any): boolean {
    if ( pergunta.valor !== null && pergunta.valor !== undefined && pergunta.valor !== '' ) {
      return false;
    }

    if ( !pergunta.condicao_exibicao || pergunta.condicao_exibicao.length === 0 ) {
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
   * Intercepta mudanças de rota e executa ações específicas quando a URL corresponde a '/login' ou '/agendamento/login'.
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
}