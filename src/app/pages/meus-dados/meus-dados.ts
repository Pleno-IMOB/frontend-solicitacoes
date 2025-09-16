import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Validadores } from '../../common/validadores';
import { provideNgxMask } from 'ngx-mask';
import { MatCardModule } from '@angular/material/card';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../services/auth.service';
import { MascaraDirective } from '../../services/mascara/mascara.directive';
import { UtilsService } from '../../services/utils.service';
import { MatDialogRef } from '@angular/material/dialog';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { firstValueFrom } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { ClienteInterface } from '../../common/types';
import { MatBadgeModule } from '@angular/material/badge';
import { fileToBase64 } from '../../common/common';
import { CommonService } from '../../services/common.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-meus-dados',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButton,
    MatDividerModule,
    MascaraDirective,
    RecaptchaV3Module,
    MatCheckbox,
    MatBadgeModule,
    AsyncPipe
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './meus-dados.html',
  styleUrl: './meus-dados.scss',
  standalone: true
})
export class MeusDados implements AfterViewInit, OnInit {
  protected form: FormGroup;
  protected souCliente: boolean = false;
  protected readonly UtilsService = UtilsService;

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
      host: [ this.backend.urlSistema, [ Validators.required ] ],
      pes_logo: [ null ],
      nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      email: [ null, [ Validators.required, Validators.email ] ],
      telefone: [ null, [ Validators.required, Validadores.celular ] ],
      usu_codigo: [ null ],
      cli_codigo: [ null ],
      sou_cliente: [ false ],
      cli_nome: [ null, [ Validators.required, Validators.minLength(4) ] ],
      cli_cpfCnpj: [ null, [ Validators.required, Validadores.cpfCnpj ] ]
    });

    this.form.get('sou_cliente')?.valueChanges.subscribe((valor: boolean): void => {
      this.souCliente = valor;
      const nome = this.form.get('nome')?.value;

      if ( valor && nome ) {
        this.form.get('cli_nome')?.setValue(nome);
      }
    });

    if ( this.authService.pessoa?.value ) {
      this.form.patchValue({
        ...this.authService.pessoa?.value,
        nome: this.authService.pessoa?.value?.pes_nome,
        telefone: this.authService.pessoa?.value?.pes_telefone,
        email: this.authService.pessoa?.value?.pes_email,
        pes_logo: this.authService.pessoa?.value?.pes_logo
      });
    }
  }

  /**
   * Inicializa o componente carregando e definindo os dados do cliente.
   * @return {Promise<void>} Uma Promise que é resolvida quando os dados do cliente são obtidos e definidos.
   */
  async ngOnInit (): Promise<void> {
    await this.getAndSetDadosCliente();
  }

  /**
   * Executa lógica após a inicialização da visualização do componente.
   * @return {Promise<void>} Retorna uma Promise que resolve quando as operações assíncronas são concluídas.
   */
  async ngAfterViewInit (): Promise<void> {
    this.observaMudancasCpfCnpj();
    this.cdr.detectChanges();
  }

  /**
   * Realiza o login de agendamento utilizando as credenciais do formulário.
   * @return Promessa que resolve com a resposta do login ou lança um erro.
   */
  protected async loginAgendamento (): Promise<any> {
    if ( this.form.invalid || UtilsService.loadingGeral.value || UtilsService.loading.value ) {
      return;
    }
    UtilsService.carregandoGeral(true);
    try {
      const response: any = await this.backend.apiPost(`login/loginAgendamento`, {
        ...this.form.value,
        recaptcha: await firstValueFrom(this.recaptchaV3Service.execute('signup')),
        recaptchaVersion: 3
      });
      if ( response ) {
        await this.authService.atualizarPessoa(response);
        this.matDialogRef.close(this.authService.pessoa.value);
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

  /**
   * Observa mudanças no campo de CPF/CNPJ e realiza busca quando o valor é válido.
   */
  private observaMudancasCpfCnpj (): void {
    this.form.get('cli_cpfCnpj')?.valueChanges.subscribe(async (valor: string): Promise<void> => {
      if ( UtilsService.loadingGeral.value || (valor?.length !== 14 && valor?.length !== 18) ) {
        return;
      } else {
        await this.buscarPorCpfCnpj(this.form.get('cli_cpfCnpj'));
      }
    });
  }

  /**
   * Obtém e define os dados do cliente no formulário.
   * @returns {Promise<void>} Promessa que resolve quando os dados do cliente são atualizados.
   */
  private async getAndSetDadosCliente (): Promise<void> {
    UtilsService.carregandoGeral(true);
    const cliente: ClienteInterface = await this.backend.apiGet(`cliente/${this.authService.pessoa?.value?.cli_codigo}/show`);
    this.form.patchValue({ cli_nome: cliente.pessoa?.pes_nome, cli_cpfCnpj: cliente.pessoa?.cpf_ou_cnpj });
    UtilsService.carregandoGeral(false);
  }
}