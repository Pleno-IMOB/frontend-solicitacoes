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
import { Anexo, PerguntaResposta } from '../../common/types';
import { IaMessage } from '../../components/ia-message/ia-message';
import { UserMessage } from '../../components/user-message/user-message';
import moment from 'moment';
import { UserAudio } from '../../components/user-audio/user-audio';
import { BackendService } from '../../services/backend.service';
import { Login } from '../login/login';
import { firstValueFrom } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { UserArquivo } from '../../components/user-arquivo/user-arquivo';
import { MeusDados } from '../meus-dados/meus-dados';

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
    IaMessage,
    UserMessage,
    UserAudio,
    UserArquivo
  ],
  templateUrl: './home.html',
  standalone: true,
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  protected listaPerguntasRespostas: PerguntaResposta[] = [];
  protected index: number = 0;
  protected finalizado: boolean = false;
  protected payload!: any;
  protected solicitacaoFinalizada: boolean = false;
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

  /**
   * Inicializa o componente e executa ações com base na rota ativa.
   * @return Promessa que resolve quando a inicialização é concluída.
   */
  async ngOnInit (): Promise<void> {
    this.interceptarMudancaDeRota();
    await this.enviaPerguntaResposta('', 'mensagem');
  }

  /**
   * Obtém a URL do logo da imobiliária.
   * @return URL do logo como string.
   */
  protected getLogo (): string {
    return `https://api.sistemaspleno-homolog.com/api/vistoria/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Recebe uma mensagem e a envia ao backend.
   * @param dado - Mensagem recebida como string.
   * @return Promessa que resolve quando a operação é concluída.
   */
  protected async recebeMensagem (dado: string): Promise<void> {
    await this.enviaPerguntaResposta(dado, 'mensagem');
  }

  /**
   * Recebe um áudio e o envia ao backend.
   * @param dado - Dados do áudio a serem enviados.
   * @return Promessa que resolve quando a operação é concluída.
   */
  protected async recebeAudio (dado: any): Promise<void> {
    await this.enviaPerguntaResposta(dado, 'audio');
  }

  /**
   * Recebe um arquivo e o envia ao backend.
   * @param dado - Dados do arquivo a serem enviados.
   * @return Promessa que resolve quando a operação é concluída.
   */
  protected async recebeArquivo (dado: any): Promise<void> {
    await this.enviaPerguntaResposta(dado, 'arquivo');
  }

  /**
   * Envia uma pergunta ou resposta ao backend e atualiza a interface do usuário.
   * @param dado - Dados a serem enviados, podendo ser uma string ou um objeto com informações adicionais.
   * @param tipoDado - Tipo de dado enviado, que pode ser 'audio', 'mensagem' ou 'arquivo'.
   * @return Promessa que resolve quando a operação é concluída.
   */
  protected async enviaPerguntaResposta (dado: any, tipoDado: 'audio' | 'mensagem' | 'arquivo'): Promise<void> {
    this.finalizado = false;
    const time = moment().format('HH:mm:ss DD/MM/YY');
    const index = this.index;

    let user_instruction: string | string[] = '';
    let userMessage: PerguntaResposta['userMessage'];

    switch ( tipoDado ) {
      case 'mensagem':
        user_instruction = dado;
        userMessage = {
          message: dado,
          time,
          index,
          isAudio: false
        };
        break;

      case 'audio':
        user_instruction = dado.base64;
        userMessage = {
          ...dado,
          time,
          index,
          isAudio: true
        };
        break;

      case 'arquivo':
        userMessage = {
          ...dado,
          time,
          index,
          isAudio: false
        };
        break;
    }

    const perguntaResposta: PerguntaResposta = {
      index,
      iaMessage: { message: '', time, index, loading: true },
      userMessage
    };

    const anexos: string[] = (dado.anexos || []).map((anexo: Anexo) => anexo.base64);

    this.listaPerguntasRespostas.push(perguntaResposta);
    this.cd.detectChanges();
    this.rolarParaBaixo();
    UtilsService.carregando(true);

    const params = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      user_instruction,
      anexos,
      cli_codigo: this.authService.pessoa.value?.cli_codigo,
      pes_codigo: this.authService.pessoa.value?.pes_codigo
    };

    const response = await this.backend.apiPost<{
      resposta: {
        finalizado: boolean;
        message: string;
        payload: any;
      },
      thread_id: string;
    }>('solicitacao/chat/solicitar', params);

    if ( response ) {
      this.finalizado = response?.resposta?.finalizado;
      if ( this.finalizado ) {
        this.payload = response.resposta?.payload;
      }

      this.thread_id = response.thread_id;
      const timeIA = moment().format('HH:mm:ss DD/MM/YY');
      this.listaPerguntasRespostas[index].iaMessage = {
        message: response?.resposta?.message,
        time: timeIA,
        index,
        loading: false
      };
      this.index++;
    }

    UtilsService.carregando(false);
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
        await this.enviaPerguntaResposta('O cliente e o usuário foram setados com sucesso.', 'mensagem');
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
        await this.enviaPerguntaResposta('O cliente e o usuário foram setados com sucesso.', 'mensagem');
        UtilsService.notifySuccess('', 'Login efetuado com sucesso!');
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