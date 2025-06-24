import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CidadeOperacao, Imobiliaria } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cidade-operacao-card',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './cidade-operacao-card.html',
  styleUrl: './cidade-operacao-card.scss',
  standalone: true
})
export class CidadeOperacaoCard implements OnInit {
  @Input() empresa!: Imobiliaria;
  @Input() cidadeOperacao!: CidadeOperacao;
  @Output() selecionarCidade: EventEmitter<CidadeOperacao> = new EventEmitter<CidadeOperacao>();
  protected currentHost: string = '';

  constructor (@Inject(PLATFORM_ID) private platformId: object) {
  }

  ngOnInit (): void {
    if ( isPlatformBrowser(this.platformId) ) {
      this.currentHost = window.location.host;
      this.currentHost = 'novaimoveispf.sistemaspleno.com';
    }
  }

  /**
   * Emite o evento de seleção da cidade de operação.
   */
  protected aoSelecionar (): void {
    this.selecionarCidade.emit(this.cidadeOperacao);
  }
}
