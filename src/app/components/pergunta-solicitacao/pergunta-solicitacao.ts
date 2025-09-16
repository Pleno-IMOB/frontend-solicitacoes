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

@Component({
  selector: 'app-pergunta-solicitacao',
  imports: [
    MatFormField,
    MatFormFieldModule,
    MascaraDirective,
    MatButton,
    MatChipListbox,
    MatChipOption,
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
    ReactiveFormsModule
  ],
  templateUrl: './pergunta-solicitacao.html',
  styleUrl: './pergunta-solicitacao.scss',
  standalone: true
})
export class PerguntaSolicitacao implements OnInit, OnChanges, OnDestroy {
  @Input() public perguntaSolicitacao!: PerguntaSolicitacaoInterface;
  @Output() enviaRespostaUsuario = new EventEmitter<{
    valor: string | OptionRespostaSolicitacaoInterface | AnexoInterface[];
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
    protected backend: BackendService
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
    if ( this.perguntaSolicitacao?.obrigatorio ) {
      this.form.get('resposta')?.setValidators([ Validators.required ]);
    }

    this.filteredOptions = this.perguntaSolicitacao?.options ?? [];

    this.searchSub = this.form.get('search')?.valueChanges.subscribe((value: string) => {
      this.filteredOptions = this.perguntaSolicitacao.options.filter(opt =>
        this.removeAccents(opt.label_desc).includes(this.removeAccents(value || ''))
      );
    });

    this.time = moment().format('HH:mm:ss DD/MM/YY');
  }

  /**
   * Atualiza o formulário e suas validações quando há mudanças nas propriedades de entrada.
   */
  ngOnChanges (): void {
    setTimeout(() => this.matSelect?.close());
    this.form.reset();
    this.form.get('resposta')?.clearValidators();
    this.form.get('resposta')?.updateValueAndValidity();

    if ( this.perguntaSolicitacao?.obrigatorio ) {
      this.form.get('resposta')?.setValidators([ Validators.required ]);
    }

    const temInput = this.perguntaSolicitacao?.tipo_input === 'TEXT' ||
      this.perguntaSolicitacao?.tipo_input === 'INTEGER' ||
      this.perguntaSolicitacao?.tipo_input === 'FLOAT' ||
      this.perguntaSolicitacao?.tipo_input === 'TEL' ||
      this.perguntaSolicitacao?.tipo_input === 'CURRENCY' ||
      this.perguntaSolicitacao?.tipo_input === 'CPF' ||
      this.perguntaSolicitacao?.tipo_input === 'CEP';

    this.filteredOptions = this.perguntaSolicitacao?.options ?? [];
    this.form.updateValueAndValidity();
    setTimeout((): void => {
      if ( temInput && this.respostaInput ) {
        this.respostaInput.nativeElement.focus();
      }
    }, 300);
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
  protected enviarMensagem (pular: boolean = false): void {
    if ( !pular ) {
      if ( this.perguntaSolicitacao.tipo_input === 'DATETIME' ) {
        const time = moment(this.form.get('time')?.value).format('HH:mm:ss');
        const datetime = {
          label_value: `${moment(this.form.get('date')?.value).format('YYYY-MM-DD')} ${time}`,
          label_desc: `${moment(this.form.get('date')?.value).format('DD/MM/YYYY')} - ${time}`
        };
        this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
        setTimeout(() => this.matSelect?.close());
      } else if ( this.perguntaSolicitacao.tipo_input === 'DATE' ) {
        const datetime = {
          label_value: `${moment(this.form.get('date')?.value).format('YYYY-MM-DD')}`,
          label_desc: `${moment(this.form.get('date')?.value).format('DD/MM/YY')}`
        };
        this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
        setTimeout(() => this.matSelect?.close());
      } else if ( this.perguntaSolicitacao.tipo_input === 'TIME' ) {
        const time = moment(this.form.get('time')?.value).format('HH:mm:ss');
        const datetime = {
          label_value: time,
          label_desc: time
        };
        this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
        setTimeout(() => this.matSelect?.close());
      } else if ( this.perguntaSolicitacao.tipo_input as any === 'DATE' ) {
        const datetime = {
          label_value: `${moment(this.form.get('date')?.value).format('YY/MM/DD')}`,
          label_desc: `${moment(this.form.get('date')?.value).format('DD/MM/YY')}`
        };
        this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
        setTimeout(() => this.matSelect?.close());
      } else {
        this.enviaRespostaUsuario.emit({ valor: this.form.get('resposta')?.value, tipo: this.perguntaSolicitacao.tipo_input });
        setTimeout(() => this.matSelect?.close());
      }
    } else {
      this.enviaRespostaUsuario.emit({ valor: 'Não informado.', tipo: 'PULAR' });
      setTimeout(() => this.matSelect?.close());
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

        this.enviaRespostaUsuario.emit({ valor: listaAnexos, tipo: this.perguntaSolicitacao.tipo_input });
      }
    });

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 0);
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
