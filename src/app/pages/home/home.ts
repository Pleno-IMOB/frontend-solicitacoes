import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, Location } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PerguntaResposta, Resposta } from '../../common/types';
import { IaMessage } from '../../components/ia-message/ia-message';
import { UserMessage } from '../../components/user-message/user-message';
import moment from 'moment';
import { UserAudio } from '../../components/user-audio/user-audio';
import { BackendService } from '../../services/backend.service';
import { UsuarioService } from '../../services/usuario.service';
import { Login } from '../login/login';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils.service';

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
    UserAudio
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

  constructor (
    private cd: ChangeDetectorRef,
    private backend: BackendService,
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private router: Router,
    private ngZone: NgZone
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

      if (url === '/login') {
        self.ngZone.run(() => {
          self.login();
        });
      }
    };
    await this.enviaPerguntaResposta();
  }

  /**
   * Obtém a URL do logo da imobiliária.
   * @return URL do logo como string.
   */
  protected getLogo (): string {
    return `${this.backend.baseURL}/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Processa e envia dados recebidos, rolando a visualização para baixo antes e depois.
   * @param dado Dado a ser processado e enviado.
   * @return Promessa que resolve quando o processamento é concluído.
   */
  protected async recebeDado (dado: string | Resposta): Promise<void> {
    this.rolarParaBaixo();
    await this.enviaPerguntaResposta(dado);
    this.rolarParaBaixo();
  }

  /**
   * Envia uma pergunta e recebe uma resposta, atualizando a lista de interações.
   * @param dado Dado a ser enviado na pergunta.
   * @return Promessa que resolve quando a interação é concluída.
   */
  protected async enviaPerguntaResposta (dado: string | Resposta = ''): Promise<void> {
    let perguntaResposta: PerguntaResposta;
    this.loading = true;
    this.finalizado = false;
    const time: string = moment().format('HH:mm:ss DD/MM/YY');
    if ( typeof dado === 'string' ) {
      perguntaResposta = {
        index: this.index,
        iaMessage: { message: '', time: '', index: this.index, loading: true },
        userMessage: { message: dado, time, index: this.index, isAudio: false }
      };
    } else {
      perguntaResposta = {
        index: this.index,
        iaMessage: { message: '', time, index: this.index, loading: true },
        userMessage: { ...dado, time, index: this.index, isAudio: true }
      };
    }
    this.listaPerguntasRespostas.push(perguntaResposta);
    this.cd.detectChanges();
    this.rolarParaBaixo();
    const params = {
      host: this.backend.urlSistema,
      thread_id: this.thread_id,
      user_instruction: typeof dado !== 'string' ? dado?.base64 : dado
    };

    this.rolarParaBaixo();

    const response: { resposta: { finalizado: boolean, message: string, payload: any }, thread_id: string } = await this.backend.apiPost('solicitacao/chat/solicitar', params);
    this.finalizado = response.resposta?.finalizado;
    this.thread_id = response.thread_id;
    const timeIA: string = moment().format('HH:mm:ss DD/MM/YY');
    this.listaPerguntasRespostas[this.index].iaMessage = { message: response.resposta.message, time: timeIA, index: this.index, loading: false };
    this.index++;
    this.loading = false;
    this.rolarParaBaixo();
  }

  /**
   * Confirma o agendamento, solicitando login se necessário.
   * @return Promessa que resolve quando a confirmação é concluída.
   */
  protected async confirmarAgendamento (): Promise<void> {
    if ( !this.usuarioService.usuario || !this.usuarioService.usuarioIsLogged ) {
      await this.openLoginDialog();
    } else {
      this.finalizarAgendamento();
    }
  }

  /**
   * Abre um diálogo de login e aguarda o resultado.
   * @return Promessa que resolve quando o diálogo é fechado.
   */
  protected async openLoginDialog (): Promise<void> {
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
      console.log(result);
    }
  }

  /**
   * Realiza o processo de login exibindo um diálogo e redirecionando após sucesso.
   * @return Promessa que resolve quando o login é concluído.
   */
  private async login () {
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
      const time = 3000;
      UtilsService.notifySuccess('Iremos lhe redirecionar em alguns segundos!', 'Login efetuado com sucesso!', { timeOut: time });
      setTimeout(() => {
        this.router.navigateByUrl('/');   ///// TODO AQUI NAO DEVE REDIRECIONAR
      }, time);
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
  private finalizarAgendamento (): void {

  }
}
