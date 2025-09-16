import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { PerguntaSolicitacaoInterface } from '../../common/types';
import { MatFormField, MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../services/backend.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-pergunta-solicitacao',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatIcon,
    MatSelect,
    MatOption
  ],
  templateUrl: './pergunta-solicitacao.html',
  styleUrl: './pergunta-solicitacao.scss',
  standalone: true
})
export class PerguntaSolicitacao implements OnInit, OnChanges, OnDestroy {
  @Input() public perguntaSolicitacao!: PerguntaSolicitacaoInterface;
  @Output() enviaRespostaUsuario: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(MatSelect) matSelect?: MatSelect;
  protected form: FormGroup;
  protected filteredOptions: any[] = [];
  protected time!: string;
  private searchSub?: Subscription;

  constructor (
    private formBuilder: FormBuilder,
    protected backend: BackendService
  ) {
    this.form = this.formBuilder.group({
      resposta: [ null ],
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
    this.form.reset();
    this.form.get('resposta')?.clearValidators();
    this.form.get('resposta')?.updateValueAndValidity();
    setTimeout(() => this.matSelect?.close());
    if ( this.perguntaSolicitacao?.obrigatorio ) {
      this.form.get('resposta')?.setValidators([ Validators.required ]);
    }

    this.filteredOptions = this.perguntaSolicitacao?.options ?? [];
  }

  ngOnDestroy (): void {
    this.searchSub?.unsubscribe();
  }

  protected enviarMensagem (): void {
    this.enviaRespostaUsuario.emit(this.form.get('resposta')?.value);
    setTimeout(() => this.matSelect?.close());
  }

  private removeAccents (value: string): string {
    return value
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      : '';
  }
}
