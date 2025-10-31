import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AnexoInterface, OptionRespostaSolicitacaoInterface, PerguntaSolicitacaoInterface } from '../../common/types';
import { MatFormField, MatInput, MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../services/backend.service';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { OnlyNumbers } from '../../directives/onlyNumbers';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepicker, MatTimepickerInput, MatTimepickerToggle } from '@angular/material/timepicker';
import { MascaraDirective } from '../../services/mascara/mascara.directive';
import { UtilsService } from '../../services/utils.service';
import { base64ToBlob, fileToBase64 } from '../../common/common';
import Swal from 'sweetalert2';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { SafePipe } from '../../directives/safe.pipe';
import { Nl2BrPipe } from '../../directives/Nl2BrPipe';

@Component({
  selector: 'app-pergunta-solicitacao',
  imports: [
    MatFormField,
    MatFormFieldModule,
    MascaraDirective,
    MatButton,
    MatDatepickerModule,
    MatIcon,
    MatIconModule,
    MatInput,
    MatInputModule,
    MatNativeDateModule,
    MatOption,
    MatProgressSpinner,
    MatSelect,
    MatTimepicker,
    MatTimepickerInput,
    MatTimepickerToggle,
    NgxCurrencyDirective,
    OnlyNumbers,
    ReactiveFormsModule,
    SafePipe,
    Nl2BrPipe,
    MatChipListbox,
    MatChipOption
  ],
  templateUrl: './pergunta-solicitacao.html',
  styleUrl: './pergunta-solicitacao.scss',
  standalone: true
})
export class PerguntaSolicitacao implements OnInit, OnChanges, OnDestroy {
  @Input() public perguntaSolicitacao!: PerguntaSolicitacaoInterface;
  @Output() enviaRespostaUsuario = new EventEmitter<{
    valor: OptionRespostaSolicitacaoInterface;
    tipo: string;
  }>();
  @Output() enviaRespostaAnexo = new EventEmitter<{
    valor: AnexoInterface[];
    tipo: string;
  }>();
  @ViewChild(MatSelect) matSelect?: MatSelect;
  @ViewChild('respostaInput') respostaInput?: ElementRef<HTMLInputElement>;
  protected form: FormGroup;
  protected filteredOptions: any[] = [];
  protected time!: string;
  protected readonly UtilsService = UtilsService;
  private searchSub?: Subscription;

  constructor (
    private formBuilder: FormBuilder,
    protected backend: BackendService,
    private currencyPipe: CurrencyPipe
  ) {
    this.form = this.formBuilder.group({
      resposta: [ null ],
      date: [ null ],
      time: [ null ],
      search: [ null ]
    });
  }

  /**
   * Inicializa o componente configurando validações e opções filtradas.
   */
  ngOnInit (): void {
    this.inicializaPerguntaSolicitacao();
  }

  /**
   * Atualiza o formulário e suas validações quando há mudanças nas propriedades de entrada.
   */
  ngOnChanges (): void {
    this.reiniciaPerguntaSolicitacao();
    this.inicializaPerguntaSolicitacao();
    this.form.updateValueAndValidity();
    this.focaProximoInput();
  }

  /**
   * Limpa a assinatura da subscrição de pesquisa ao destruir o componente.
   */
  ngOnDestroy (): void {
    this.searchSub?.unsubscribe();
  }

  /**
   * Envia a resposta do usuário com base no tipo de entrada da pergunta.
   * @param pular Indica se a resposta deve ser pulada.
   */
  protected enviarMensagem (pular: boolean = false) {
    let valorResposta: { label_value: string; label_desc: string } | null;

    const resposta = this.form.get('resposta')?.value;
    if ( resposta?.label_action ) {
      window.open(resposta.label_action, '_blank');
      return;
    }

    if ( pular ) {
      valorResposta = {
        label_value: 'Não informado.',
        label_desc: 'Não informado.'
      };
      this.enviaRespostaUsuario.emit({ valor: valorResposta, tipo: 'PULAR' });
      return;
    }

    switch ( this.perguntaSolicitacao.tipo_input ) {
      case 'DATETIME': {
        const time = moment(this.form.get('time')?.value).format('HH:mm:ss');
        const date = moment(this.form.get('date')?.value);
        valorResposta = {
          label_value: `${date.format('YYYY-MM-DD')} ${time}`,
          label_desc: `${date.format('DD/MM/YYYY')} - ${time}`
        };
        break;
      }

      case 'DATE': {
        const date = moment(this.form.get('date')?.value);
        valorResposta = {
          label_value: date.format('YYYY-MM-DD'),
          label_desc: date.format('DD/MM/YY')
        };
        break;
      }

      case 'TIME': {
        const time = moment(this.form.get('time')?.value).format('HH:mm:ss');
        valorResposta = {
          label_value: time,
          label_desc: time
        };
        break;
      }

      case 'FLOAT': {
        const valor = this.currencyPipe.transform(this.form.get('resposta')?.value, 'BRL', '', '1.2-2', 'pt-BR');
        valorResposta = {
          label_value: this.form.get('resposta')?.value,
          label_desc: valor || ''
        };
        break;
      }

      case 'CURRENCY': {
        const valor = this.currencyPipe.transform(this.form.get('resposta')?.value, 'BRL', 'symbol', '1.2-2', 'pt-BR');
        valorResposta = {
          label_value: this.form.get('resposta')?.value,
          label_desc: valor || ''
        };
        break;
      }

      case 'SELECT': {
        valorResposta = {
          label_value: this.form.get('resposta')?.value?.label_value,
          label_desc: this.form.get('resposta')?.value?.label_desc || ''
        };
        break;
      }

      default: {
        valorResposta = {
          label_value: this.form.get('resposta')?.value,
          label_desc: this.form.get('resposta')?.value
        };
        break;
      }
    }

    if ( valorResposta ) {
      this.enviaRespostaUsuario.emit({
        valor: valorResposta,
        tipo: this.perguntaSolicitacao.tipo_input
      });
      this.forcaFecharInputSelect();
    }
  }

  /**
   * Abre um seletor de arquivos oculto e processa o arquivo selecionado.
   */
  protected selecionarArquivo (): void {
    const listaAnexos: AnexoInterface[] = [];
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf';
    input.multiple = true;
    input.style.display = 'none';

    input.addEventListener('change', async (event: Event): Promise<void> => {
      const target = event.target as HTMLInputElement;
      if ( target.files && target.files.length > 0 ) {
        const tiposPermitidos: string[] = [ 'pdf', 'doc', 'docx', 'xls', 'xlsx' ];

        for ( const arquivo of Array.from(target.files) ) {
          let index = 0;
          const extensao: string | undefined = arquivo.name.split('.').pop()?.toLowerCase();

          if ( !extensao || !tiposPermitidos.includes(extensao) ) {
            await Swal.fire({
              html: `<h3>Tipo de arquivo inválido</h3><br><h4>Permitidos (PDF, DOC e XLS).</h4>`,
              icon: 'error',
              focusCancel: true,
              customClass: { confirmButton: 'btn btn-warning' },
              allowOutsideClick: false,
              allowEscapeKey: false
            });
            continue;
          }

          const base64: string = await fileToBase64(arquivo);
          const blob: Blob = base64ToBlob(base64, `application/${extensao}`);
          const url: string = URL.createObjectURL(blob);
          const name: string = arquivo?.name;
          const time: string = moment().format('HH:mm:ss DD/MM/YY');

          listaAnexos.push({
            base64,
            blob,
            url,
            name,
            time,
            index
          });

          index++;
        }

        this.enviaRespostaAnexo.emit({ valor: listaAnexos, tipo: this.perguntaSolicitacao.tipo_input });
      }
    });

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 0);
  }

  /**
   * Define o valor da resposta com base na pergunta selecionada e envia uma mensagem.
   * @param {PerguntaSolicitacaoInterface} pergunta Objeto da pergunta selecionada.
   * @returns {void} Não retorna nenhum valor.
   */
  protected clickChip (pergunta: PerguntaSolicitacaoInterface): void {
    this.form.get('resposta')?.setValue(pergunta);
    this.enviarMensagem();
  }

  /**
   * Fecha o seletor de opções se estiver aberto.
   */
  private forcaFecharInputSelect (): void {
    if ( this.matSelect ) {
      setTimeout((): void => this.matSelect?.close());
    }
  }

  /**
   * Foca no próximo campo de entrada após um atraso.
   */
  private focaProximoInput (): void {
    setTimeout((): void => {
      if ( this.respostaInput ) {
        this.respostaInput.nativeElement.focus();
      }
    }, 300);
  }

  /**
   * Reinicia o formulário e fecha o seletor de opções.
   * @private
   */
  private reiniciaPerguntaSolicitacao (): void {
    this.forcaFecharInputSelect();
    this.form.reset();
    this.form.get('resposta')?.clearValidators();
    this.form.get('resposta')?.updateValueAndValidity();
  }

  /**
   * Inicializa a pergunta da solicitação configurando validações e opções filtradas.
   * @private
   */
  private inicializaPerguntaSolicitacao (): void {
    if ( this.perguntaSolicitacao?.obrigatorio ) {
      this.form.get('resposta')?.setValidators([ Validators.required ]);
    }

    this.filteredOptions = this.perguntaSolicitacao?.options ?? [];

    this.searchSub = this.form.get('search')?.valueChanges.subscribe((value: string): void => {
      this.filteredOptions = this.perguntaSolicitacao.options.filter(opt =>
        this.removeAccents(opt.label_desc).includes(this.removeAccents(value || ''))
      );
    });

    this.time = moment().format('HH:mm:ss DD/MM/YY');
  }

  /**
   * Remove acentos de uma string e a transforma em minúsculas.
   * @param value A string que terá os acentos removidos.
   * @returns A string sem acentos e em minúsculas.
   */
  private removeAccents (value: string): string {
    return value
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';
  }
}
