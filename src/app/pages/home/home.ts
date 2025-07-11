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
import { IndividualConfig, ToastrService } from 'ngx-toastr';

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
  protected loading: boolean = false;
  protected finalizado: boolean = false;
  @ViewChild('scrollContainer') private conversaContainer!: ElementRef;
  private thread_id: string = '';
  protected payload!: any;
  protected solicitacaoFinalizada: boolean = false;
  private options: Partial<IndividualConfig> = {
    positionClass: 'toast-bottom-center',
    progressBar: true,
    timeOut: 3000,
    closeButton: true,
  };

  constructor (
    private cd: ChangeDetectorRef,
    private backend: BackendService,
    private dialog: MatDialog,
    protected authService: AuthService,
    private ngZone: NgZone,
    private toastr: ToastrService,
  ) {
  }

  /**
   * Inicializa o componente e executa ações com base na rota ativa.
   * @return Promessa que resolve quando a inicialização é concluída.
   */
  async ngOnInit(): Promise<void> {
    const originalPushState = window.history.pushState;
    const self = this;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      const url = args[2] as string;

      if (url === '/login' || url === '/agendamento/login') {
        self.ngZone.run(() => {
          self.login();
        });
      }
    };
    await this.enviaPerguntaResposta('', 'mensagem');
  }

  /**
   * Obtém a URL do logo da imobiliária.
   * @return URL do logo como string.
   */
  protected getLogo (): string {
    return `${this.backend.baseURL}/logo-imobiliaria?host=${this.backend.urlSistema}`;
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
    let perguntaResposta!: PerguntaResposta;
    let user_instruction: string | string[] = '';
    this.loading = true;
    this.finalizado = false;
    const time: string = moment().format('HH:mm:ss DD/MM/YY');
    if(tipoDado === 'mensagem') {
      perguntaResposta = {
        index: this.index,
        iaMessage: { message: '', time: '', index: this.index, loading: true },
        userMessage: { message: dado, time, index: this.index, isAudio: false }
      };

      user_instruction = dado;
    }
    if(tipoDado === 'audio') {
      perguntaResposta = {
        index: this.index,
        iaMessage: { message: '', time, index: this.index, loading: true },
        userMessage: { ...dado, time, index: this.index, isAudio: true }
      };

      user_instruction = dado.base64;
    }
    if(tipoDado === 'arquivo') {
      perguntaResposta = {
        index: this.index,
        iaMessage: { message: '', time, index: this.index, loading: true },
        userMessage: { ...dado, time, index: this.index, isAudio: false }
      };
    }

    let anexos = (dado.anexos || []).map((anexo: Anexo): string => {
      return anexo.base64
    });

    this.listaPerguntasRespostas.push(perguntaResposta);
    this.cd.detectChanges();
    const params = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      user_instruction,
      anexos,
      cli_codigo: this.authService.usuario.value?.cli_codigo,
      usu_codigo: this.authService.usuario.value?.usu_codigo
    };

    this.rolarParaBaixo();

    const response: {
      resposta: {
        finalizado: boolean,
        message: string,
        payload: any
      },
      thread_id: string
    } = await this.backend.apiPost('solicitacao/chat/solicitar', params);

    if(response) {
      this.finalizado = response.resposta?.finalizado;
      if(this.finalizado) {
        this.payload = response.resposta?.payload;
      }
      this.thread_id = response.thread_id;
      const timeIA: string = moment().format('HH:mm:ss DD/MM/YY');
      this.listaPerguntasRespostas[this.index].iaMessage = { message: response.resposta.message, time: timeIA, index: this.index, loading: false };
      this.index++;
      this.loading = false;
    } else {
      this.loading = false;
    }

    this.rolarParaBaixo();
  }

  /**
   * Realiza o processo de login exibindo um diálogo e redirecionando após sucesso.
   * @return Promessa que resolve quando o login é concluído.
   */
  protected async login () {
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
      setTimeout((): void => {
        this.toastr.success('', 'Login efetuado com sucesso!', this.options);
        window.history.pushState({}, '', ('/agendamento'));
      }, 1000);

      if(!UtilsService.loadingGeral.value && this.authService.usuario.value?.usu_codigo && this.authService.usuario.value?.cli_codigo) {
        await this.enviaPerguntaResposta('O cliente e o usuário foram setados com sucesso.', 'mensagem');
      }
    }
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
   * Finaliza o agendamento (implementação pendente).
   * @return Não retorna valor.
   */
  protected async finalizarAgendamento (): Promise<void> {
    UtilsService.carregandoGeral(true);
    this.payload = {...this.payload}
    const response: any = await this.backend.apiPost('solicitacao/chat/store', this.payload);
    if(response) {
      this.solicitacaoFinalizada = true;
    }
    this.thread_id = '';
    UtilsService.carregandoGeral(false);
    this.toastr.success('Sua solicitação de vistoria foi agendada com sucesso.', 'Agendado!', this.options);
  }

  /**
   * Reinicia a aplicação recarregando a página atual.
   */
  protected iniciarNovaSolicitacao (): void {
    setTimeout(() => window.location.reload(), 1000);
  }
}
