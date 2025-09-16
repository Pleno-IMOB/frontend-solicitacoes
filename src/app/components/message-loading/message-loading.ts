import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BackendService } from '../../services/backend.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-message-loading',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-loading.html',
  styleUrl: './message-loading.scss',
  standalone: true
})
export class MessageLoading implements OnInit, OnChanges, OnDestroy {
  protected digitandoTexto: string = 'Digitando..';
  private intervalId: any;
  private estados: string[] = [ 'Digitando.', 'Digitando..', 'Digitando...' ];
  private indexMsg = 0;

  constructor (
    protected backend: BackendService
  ) {
  }

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
    if ( UtilsService.loading.value ) {
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
    }
  }
}