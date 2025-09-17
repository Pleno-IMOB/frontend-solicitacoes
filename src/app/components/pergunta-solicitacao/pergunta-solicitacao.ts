import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { OptionRespostaSolicitacaoInterface, PerguntaSolicitacaoInterface } from '../../common/types';
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

@Component({
  selector: 'app-pergunta-solicitacao',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatFormFieldModule,
    MatButton,
    MatIcon,
    MatSelect,
    MatOption,
    MatChipOption,
    MatChipListbox,
    OnlyNumbers,
    MatInputModule,
    NgxCurrencyDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTimepickerInput,
    MatTimepickerToggle,
    MatTimepicker,
    MascaraDirective
  ],
  templateUrl: './pergunta-solicitacao.html',
  styleUrl: './pergunta-solicitacao.scss',
  standalone: true
})
export class PerguntaSolicitacao implements OnInit, OnChanges, OnDestroy {
  @Input() public perguntaSolicitacao!: PerguntaSolicitacaoInterface;
  @Output() enviaRespostaUsuario = new EventEmitter<{
    valor: string | OptionRespostaSolicitacaoInterface;
    tipo: string;
  }>();
  @ViewChild(MatSelect) matSelect?: MatSelect;
  @ViewChild('respostaInput') respostaInput?: ElementRef<HTMLInputElement>;
  protected form: FormGroup;
  protected filteredOptions: any[] = [];
  protected time!: string;
  protected showForm = true;
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
      this.perguntaSolicitacao?.tipo_input === 'CEP';

    this.filteredOptions = this.perguntaSolicitacao?.options ?? [];
    this.showForm = true;
    this.form.updateValueAndValidity();
    setTimeout((): void => {
      if ( temInput && this.respostaInput ) {
        this.respostaInput.nativeElement.focus();
      }
    }, 300);
  }

  ngOnDestroy (): void {
    this.searchSub?.unsubscribe();
  }

  protected enviarMensagem (): void {
    if ( this.perguntaSolicitacao.tipo_input === 'DATETIME' ) {
      const time = moment(this.form.get('time')?.value).format('HH:mm:ss');
      const datetime = {
        label_value: `${moment(this.form.get('date')?.value).format('YY/MM/DD')} ${time}`,
        label_desc: `${moment(this.form.get('date')?.value).format('DD/MM/YY')} ${time}`
      };
      this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
      setTimeout(() => this.matSelect?.close());
    } else if ( this.perguntaSolicitacao.tipo_input === 'DATE' ) {
      const datetime = {
        label_value: `${moment(this.form.get('date')?.value).format('YY/MM/DD')}`,
        label_desc: `${moment(this.form.get('date')?.value).format('DD/MM/YY')}`
      };
      this.enviaRespostaUsuario.emit({ valor: datetime, tipo: this.perguntaSolicitacao.tipo_input });
      setTimeout(() => this.matSelect?.close());
    } else {
      this.showForm = false;
      this.enviaRespostaUsuario.emit({ valor: this.form.get('resposta')?.value, tipo: this.perguntaSolicitacao.tipo_input });
      setTimeout(() => this.matSelect?.close());
    }
  }

  private removeAccents (value: string): string {
    return value
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';
  }
}
