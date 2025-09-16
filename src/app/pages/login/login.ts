import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
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
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { firstValueFrom } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { fileToBase64 } from '../../common/common';
import { CommonService } from '../../services/common.service';

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
  protected form: FormGroup;
  protected tempoRestante: number = 60;
  protected reenviarDisponivel: boolean = false;
  protected intervalId: any;
  protected souCliente: boolean = false;
  protected nomeReadOnly: boolean = false;
  protected emailReadOnly: boolean = false;
  protected readonly UtilsService = UtilsService;
  protected pageStep: 'celular' | 'token' | 'cadastro' = 'celular';
  @ViewChild('tokenInput') private tokenInput!: ElementRef<HTMLInputElement>;

  constructor (
    private formBuilder: FormBuilder,
    private backend: BackendService,
    private authService: AuthService,
    private matDialogRef: MatDialogRef<any>,
    private recaptchaV3Service: ReCaptchaV3Service,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService
  ) {
    this.form = this.formBuilder.group({
      celular: [ null, [ Validators.required, Validadores.celular ] ],
      tok_codigo: [ null ],
      pes_codigo: [ null ],
      token: [ null, [ Validators.required, Validators.minLength(6) ] ],
      host: [ this.backend.urlSistema, [ Validators.required ] ],
      pes_logo: [ null ],
      nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      email: [ null, [ Validators.required, Validators.email ] ],
      sou_cliente: [ false ],
      cli_nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      cli_cpfCnpj: [ null, [ Validators.required, Validadores.cpfCnpj ] ]
    });

    this.form.get('sou_cliente')?.valueChanges.subscribe((valor: boolean): void => {
      this.souCliente = valor;

      if ( valor ) {
        const nome = this.form.get('nome')?.value;
        if ( nome ) {
          this.form.get('cli_nome')?.setValue(nome);
        }
      }
    });
  }

  /**
   * Executa após a inicialização da visão, configurando o foco no campo de celular e ativando a escuta para alterações no campo de CPF/CNPJ.
   * @return {Promise<void>} Retorna uma Promise que resolve quando todas as operações assíncronas são concluídas.
   */
  async ngAfterViewInit (): Promise<void> {
    if ( this.celularInput ) {
      setTimeout((): void => {
        this.celularInput.nativeElement.focus();
      }, 100);

      this.cdr.detectChanges();
    }
    this.form.get('cli_cpfCnpj')?.valueChanges.subscribe(async (valor: string): Promise<void> => {
      if ( UtilsService.loadingGeral.value || valor?.length < 14 ) {
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
    if ( this.form.invalid || UtilsService.loadingGeral.value ) {
      return;
    }
    UtilsService.carregandoGeral(true);
    const response: any = await this.backend.apiPost(`login/loginAgendamento`, {
      ...this.form.value,
      recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
      recaptchaVersion: 3
    });
    if ( response ) {
      await this.authService.atualizarPessoa(response);
      this.matDialogRef.close(this.authService.pessoa.value);
      UtilsService.carregandoGeral(false);
    }
    UtilsService.carregandoGeral(false);
  }

  /**
   * Busca informações por CPF ou CNPJ e atualiza o formulário com os dados recebidos.
   * @return Promessa que resolve quando a busca é concluída.
   */
  protected async buscarPorCpfCnpj (control: AbstractControl<any, any> | null): Promise<any> {
    if ( UtilsService.loadingGeral.value || !control?.value ) {
      return;
    }

    let host: string = this.form.get('host')?.value;
    let cpfCnpj: string = control?.value;

    if ( cpfCnpj.length === 14 ) {
      setTimeout(async (): Promise<void> => {
        UtilsService.carregandoGeral(true);
        const response = await this.commonService.buscarPorCpf(this.form.get('cli_cpfCnpj')?.value, host);

        if ( response ) {
          this.form.get('cli_nome')?.setValue(response);
        } else {
          this.form.get('cli_nome')?.setValue(null);
        }

        UtilsService.carregandoGeral(false);
      }, 1000);
    } else if ( cpfCnpj.length === 18 ) {
      setTimeout(async (): Promise<void> => {
        UtilsService.carregandoGeral(true);
        const response = await this.commonService.buscarPorCnpj(this.form.get('cli_cpfCnpj')?.value, host);

        if ( response ) {
          this.form.get('cli_nome')?.setValue(response);
        } else {
          this.form.get('cli_nome')?.setValue(null);
        }

        UtilsService.carregandoGeral(false);
      }, 1000);
    }
  }

  /**
   * Obtém a URL do logo da imobiliária.
   * @return URL do logo como string.
   */
  protected getLogo (): string {
    return `${this.backend.hostAPI}vistoria/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Envia um token de autenticação para o celular do usuário.
   * @return Promessa que resolve quando o token é enviado.
   */
  protected async enviarTokenParaCelular (): Promise<void> {
    UtilsService.carregandoGeral(true);

    const response: any = await this.backend.apiPost(`login/enviarTokenLoginAgendamento`, {
      ...this.form.value,
      recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
      recaptchaVersion: 3
    });

    UtilsService.carregandoGeral(false);
    this.form.get('tok_codigo')?.setValue(response?.tok_codigo);
    this.form.get('pes_codigo')?.setValue(response?.pes_codigo);
  }

  /**
   * Confirma o token recebido no celular e atualiza o formulário com os dados do usuário.
   * @return Promessa que resolve com a confirmação do token.
   */
  protected async confirmarTokenDoCelular (): Promise<void> {
    const tokenControl = this.form.get('token');
    const nomeControl = this.form.get('nome');
    const emailControl = this.form.get('email');
    const response: any = await this.backend.apiPost(`login/validarTokenLoginAgendamento`, {
      ...this.form.value,
      recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
      recaptchaVersion: 3
    });

    if ( !response ) {
      tokenControl?.setErrors({ tokenInvalido: true });
    } else {
      tokenControl?.setErrors(null);
      nomeControl?.setValue(response?.pes_nome);
      emailControl?.setValue(response?.pes_email);
      this.form.get('pes_logo')?.setValue(response?.pes_logo);
      this.nomeReadOnly = !!nomeControl?.value;
      this.emailReadOnly = !!emailControl?.value;
      this.authService.authToken = response?.auth_token;
    }
  }

  /**
   * Avança para a etapa de token após validar o controle fornecido.
   * @param control - Controle abstrato do formulário que será validado.
   */
  protected async avancarParaToken (control: AbstractControl<any, any> | null): Promise<void> {
    if ( control?.invalid || UtilsService.loadingGeral.value ) {
      control?.markAsDirty();
      control?.markAsTouched();
    } else {
      UtilsService.carregandoGeral(true);
      await this.enviarTokenParaCelular();
      this.iniciarContagem();
      this.form.get('token')?.setValue('');
      this.pageStep = 'token';
      UtilsService.carregandoGeral(false);

      setTimeout((): void => {
        this.tokenInput?.nativeElement.focus();
      }, 500);
    }
  }

  /**
   * Avança para a etapa de cadastro após validar o token do celular.
   * @param control - Controle abstrato do formulário que será validado.
   */
  protected async avancarParaCadastro (control: AbstractControl<any, any> | null): Promise<void> {
    if ( control?.value.length !== 6 ) {
      return;
    }
    if ( control?.invalid || UtilsService.loadingGeral.value ) {
      control?.markAsDirty();
      control?.markAsTouched();
    } else {
      UtilsService.carregandoGeral(true);
      await this.confirmarTokenDoCelular();
      this.pageStep = 'cadastro';
      UtilsService.carregandoGeral(false);
    }
  }

  /**
   * Retorna à etapa anterior do processo.
   * @return Não retorna valor.
   */
  protected voltar (): void {
    if ( this.pageStep === 'token' ) {
      this.pageStep = 'celular';
    } else {
      this.pageStep = 'token';
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

  /**
   * Atualiza a foto do usuário no formulário com base em um evento de seleção de arquivo.
   * @param event Evento de seleção de arquivo que contém o arquivo de imagem.
   */
  protected async setaFotoUsuarioInterface (event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if ( input.files && input.files.length > 0 ) {
      const file = input.files[0];
      const maxSizeInBytes = 2 * 1024 * 1024;
      if ( file.size > maxSizeInBytes ) {
        alert('A imagem é muito grande. O tamanho máximo permitido é 2MB.');
        return;
      }
      const base64 = await fileToBase64(file);
      this.form.patchValue({ pes_logo: base64 });
      this.form.get('pes_logo')?.markAsDirty();
    }
  }
}