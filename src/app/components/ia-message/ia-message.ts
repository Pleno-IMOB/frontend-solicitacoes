import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Pergunta } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Nl2BrPipe } from '../../directives/Nl2BrPipe';

@Component({
  selector: 'app-ia-message',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Nl2BrPipe
  ],
  templateUrl: './ia-message.html',
  styleUrl: './ia-message.scss',
  standalone: true
})
export class IaMessage implements OnInit, OnChanges, OnDestroy {
  @Input() logoEmpresa?: string;
  @Input() messageObj?: Pergunta;
  @Input() index?: number;
  @Output() disparaReenviarMensagem = new EventEmitter<{ dado: any, tipoDado: 'audio' | 'mensagem' | 'arquivo' }>();
  protected digitandoTexto: string = 'Digitando..';
  private intervalId: any;
  private estados: string[] = [ 'Digitando.', 'Digitando..', 'Digitando...' ];
  private indexMsg = 0;

  /**
   * Inicializa o componente e inicia o controle do texto "Digitando".
   */
  ngOnInit (): void {
    this.controlarDigitando();
  }

  /**
   * Atualiza o estado do componente quando as propriedades de entrada mudam.
   */
  ngOnChanges (): void {
    this.controlarDigitando();
  }

  /**
   * Limpa o intervalo de animação quando o componente é destruído.
   */
  ngOnDestroy (): void {
    this.limparIntervalo();
  }

  /**
   * Controla a animação do texto "Digitando" enquanto a mensagem está carregando.
   *
   * @private
   */
  private controlarDigitando (): void {
    if ( this.messageObj?.loading ) {
      if ( !this.intervalId ) {
        this.intervalId = setInterval(() => {
          this.digitandoTexto = this.estados[this.indexMsg];
          this.indexMsg = (this.indexMsg + 1) % this.estados.length;
        }, 700);
      }
    } else {
      this.limparIntervalo();
    }
  }

  /**
   * Limpa o intervalo de animação do texto "Digitando" e redefine o índice.
   */
  private limparIntervalo (): void {
    if ( this.intervalId ) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.index = 0;
    }
  }
}