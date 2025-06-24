import {Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {CidadeOperacao, Imobiliaria, Pergunta, PerguntaResposta, TipoVistoria, Usuario} from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';
import {MatProgressSpinner, MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ia-message',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ia-message.html',
  styleUrl: './ia-message.scss',
  standalone: true
})
export class IaMessage implements OnInit, OnChanges, OnDestroy {
  @Input() logoEmpresa?: string;
  @Input() logoUsuario?: string;
  @Input() messageObj?: Pergunta;
  @Input() index?: number;
  private intervalId: any;
  private estados: string[] = ['Digitando.', 'Digitando..', 'Digitando...'];
  protected digitandoTexto: string = 'Digitando..';
  private indexMsg = 0;

  constructor () {
  }

  ngOnInit (): void {
    this.controlarDigitando();
  }

  ngOnChanges (): void {
    this.controlarDigitando();
  }

  controlarDigitando() {
    if (this.messageObj?.loading) {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.digitandoTexto = this.estados[this.indexMsg];
          this.indexMsg = (this.indexMsg + 1) % this.estados.length;
        }, 700);
      }
    } else {
      this.limparIntervalo();
    }
  }

  limparIntervalo() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.index = 0;
    }
  }

  ngOnDestroy() {
    this.limparIntervalo();
  }
}
