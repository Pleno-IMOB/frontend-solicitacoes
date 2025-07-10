import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Validadores } from '../../common/validadores';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatCardModule } from '@angular/material/card';
import { CelularMaskPipe } from '../../directives/celularPipe';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../services/auth.service';
import { MascaraDirective } from '../../services/mascara/mascara.directive';
import { MostrarErrosDirective } from '../../services/mostrar-erros/mostrar-erros.directive';
import { MostrarPrimeiroErroDirective } from '../../services/mostrar-erros/mostrar-primeiro-erro.directive';
import { UtilsService } from '../../services/utils.service';
import { MatDialogRef } from '@angular/material/dialog';
import { RecaptchaV3Module, ReCaptchaV3Service } from "ng-recaptcha";
import { firstValueFrom } from "rxjs";
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButton,
    MatDividerModule,
    NgxMaskDirective,
    DatePipe,
    CelularMaskPipe,
    MascaraDirective,
    MostrarErrosDirective,
    MostrarPrimeiroErroDirective,
    AsyncPipe,
    RecaptchaV3Module,
    MatCheckbox
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login implements AfterViewInit {
  @ViewChild('celularInput') celularInput!: ElementRef<HTMLInputElement>;
  @ViewChild('tokenInput') private tokenInput!: ElementRef<HTMLInputElement>;
  protected form: FormGroup;
  protected pageIndex: number = 0;
  protected tempoRestante: number = 60;
  protected reenviarDisponivel: boolean = false;
  protected intervalId: any;
  private ultimaExecucao: number = 0;
  protected souCliente: boolean = false;
  protected nomeReadOnly: boolean = false;
  protected emailReadOnly: boolean = false;

  constructor (
    private formBuilder: FormBuilder,
    private backend: BackendService,
    private authService: AuthService,
    private matDialogRef: MatDialogRef<any>,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {
    this.form = this.formBuilder.group({
      celular: [ null, [ Validators.required, Validadores.celular ] ],
      tok_codigo: [ null ],
      token: [ null, [ Validators.required, Validators.minLength(6) ] ],
      host: [ this.backend.urlSistema, [ Validators.required ] ],
      nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      email: [ null, [ Validators.required, Validators.email ] ],
      sou_cliente: [ false ],
      cli_nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      cli_cpfCnpj: [ null, [ Validators.required, Validadores.cpfCnpj ] ]
    });


    this.form.get('sou_cliente')?.valueChanges.subscribe((valor: boolean): void => {
      this.souCliente = valor;

      if (valor) {
        const nome = this.form.get('nome')?.value;
        if(nome) {
          this.form.get('cli_nome')?.setValue(nome);
        }
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if(this.celularInput) {
      this.celularInput.nativeElement.focus();
    }
    this.form.get('cli_cpfCnpj')?.valueChanges.subscribe(async (valor: string): Promise<void> => {
      if(UtilsService.loadingGeral.value || valor?.length < 14) {
        return;
      } else {
        await this.buscarPorCpfCnpj(this.form.get('cli_cpfCnpj'));
      }
    });
  }

  /**
   * Realiza o login de agendamento utilizando as credenciais do formulário.
   * @return Promessa que resolve com a resposta do login ou lança um erro.
   */
  protected async loginAgendamento (): Promise<any> {
    UtilsService.carregandoGeral(true);
    const prefix = `${this.backend.hostAPI}portalDoCliente/`;
    try {
      const response: any = await this.backend.apiPostExternal(`${prefix}usuario/loginAgendamento`, {
        ...this.form.value,
        recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
        recaptchaVersion: 3
      });
      if( response ) {
        await this.authService.atualizarUsuario(response);
        this.matDialogRef.close(this.authService.usuario.value);
      }
    } catch ( error ) {
      console.error('Erro ao fazer loginAgendamento:', error);
      throw error;
    }
    UtilsService.carregandoGeral(false);
  }

  /**
   * Busca informações por CPF ou CNPJ e atualiza o formulário com os dados recebidos.
   * @return Promessa que resolve quando a busca é concluída.
   */
  protected async buscarPorCpfCnpj (control: AbstractControl<any, any> | null): Promise<any> {
    if(UtilsService.loadingGeral.value) {
      return;
    }
    let cpfCnpj = control?.value;
    if ( cpfCnpj.length === 14 ) {
      setTimeout(async (): Promise<void> => {
        cpfCnpj = this.form.get('cli_cpfCnpj')?.value;
        if ( cpfCnpj.length === 14 ) {
          UtilsService.carregandoGeral(true);
          const prefix = `${this.backend.hostAPI}areacliente/`;
          const response: any = await this.backend.apiGetExternal(`${prefix}pessoa/validarCpf?pes_cpf=${cpfCnpj}&sis_codigo=6&host=${this.form.get('host')?.value}`, null, (): void => {});
          if ( response && response?.length > 0 ) {
            this.form.get('cli_nome')?.setValue(response[0]?.pessoa.pes_nome);
          }
          UtilsService.carregandoGeral(false);
        }
      }, 1000);
    } else if ( cpfCnpj.length === 18 ) {
      setTimeout(async (): Promise<void> => {
        cpfCnpj = this.form.get('cli_cpfCnpj')?.value;
        if ( cpfCnpj.length === 18 ) {
          UtilsService.carregandoGeral(true);
          const prefix = `${this.backend.hostAPI}vistoria/`;
          const response: any = await this.backend.apiGetExternal(`${prefix}pessoa/buscaPorCnpj?pes_cnpj=${cpfCnpj}&sis_codigo=6&host=${this.form.get('host')?.value}`, null, (): void => {});
          if ( response ) {
            this.form.get('cli_nome')?.setValue(response?.pes_nome);
          }
          UtilsService.carregandoGeral(false);
        }
      }, 1000);
    }
  }

  /**
   * Obtém a URL do logo da imobiliária.
   * @return URL do logo como string.
   */
  protected getLogo (): string {
    return `${this.backend.baseURL}/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Envia um token de autenticação para o celular do usuário.
   * @return Promessa que resolve quando o token é enviado.
   */
  protected async enviarTokenParaCelular (): Promise<void> {
    const prefix = `${this.backend.hostAPI}portalDoCliente/`;
    UtilsService.carregandoGeral(true);

    const response: any = await this.backend.apiPostExternal(`${prefix}usuario/enviarTokenLoginAgendamento`, {
      ...this.form.value,
      recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
      recaptchaVersion: 3
    });

    UtilsService.carregandoGeral(false);
    this.form.get('tok_codigo')?.setValue(response?.tok_codigo);
  }

  /**
   * Confirma o token recebido no celular e atualiza o formulário com os dados do usuário.
   * @return Promessa que resolve com a confirmação do token.
   */
  protected async confirmarTokenDoCelular (): Promise<void> {
    const tokenControl = this.form.get('token');
    const nomeControl = this.form.get('nome');
    const emailControl = this.form.get('email');
    const prefix = `${this.backend.hostAPI}portalDoCliente/`;
    const response: any = await this.backend.apiPostExternal(`${prefix}usuario/validarTokenLoginAgendamento`, {
      ...this.form.value,
      recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
      recaptchaVersion: 3
    });

    if (!response) {
      tokenControl?.setErrors({ tokenInvalido: true });
    } else {
      tokenControl?.setErrors(null);
      nomeControl?.setValue(response?.usu_nome);
      emailControl?.setValue(response?.usu_email);
      this.nomeReadOnly = !!nomeControl?.value;
      this.emailReadOnly = !!emailControl?.value;
      this.authService.authToken = response?.auth_token;
    }
  }

  /**
   * Avança para a próxima etapa do processo, validando o controle atual.
   * @param control Controle a ser validado antes de avançar.
   * @return Promessa que resolve quando a etapa é avançada.
   */
  protected async avancar (control: AbstractControl<any, any> | null): Promise<void> {
    const agora = Date.now();
    const intervalo = 5000;

    if (agora - this.ultimaExecucao < intervalo) {
      console.warn('Aguarde antes de tentar novamente.');
      return;
    }

    this.ultimaExecucao = agora;
    if ( control?.invalid ) {
      control?.markAsDirty();
      control?.markAsTouched();
    } else {
      UtilsService.carregandoGeral(true);
      if ( this.pageIndex === 0 ) {
        await this.enviarTokenParaCelular();
        this.iniciarContagem();
        this.form.get('token')?.setValue('');
      }
      if ( this.pageIndex === 1 ) {
        await this.confirmarTokenDoCelular();
      }
      this.pageIndex++;
    }
    UtilsService.carregandoGeral(false);
    if(this.pageIndex === 1) {
      setTimeout((): void => {
        this.tokenInput?.nativeElement.focus();
      }, 500);
    }
  }

  /**
   * Retorna à etapa anterior do processo.
   * @return Não retorna valor.
   */
  protected voltar (): void {
    this.pageIndex--;

    if ( this.pageIndex === 1 ) {
      this.iniciarContagem();
    }
  }

  /**
   * Reenvia o token de autenticação para o celular do usuário.
   * @return Promessa que resolve quando o token é reenviado.
   */
  protected async reenviarToken (): Promise<void> {
    UtilsService.carregandoGeral(true);
    await this.enviarTokenParaCelular();
    this.iniciarContagem();
    UtilsService.carregandoGeral(false);
  }

  /**
   * Inicia a contagem regressiva para permitir o reenvio do token.
   * @return Não retorna valor.
   */
  protected iniciarContagem (): void {
    this.tempoRestante = 60;
    this.reenviarDisponivel = false;

    if ( this.intervalId ) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.tempoRestante--;

      if ( this.tempoRestante <= 0 ) {
        clearInterval(this.intervalId);
        this.reenviarDisponivel = true;
      }
    }, 1000);
  }

  protected readonly UtilsService = UtilsService;
}
