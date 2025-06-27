import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CidadeOperacao, Imobiliaria, TipoVistoria } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-main-card',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-card.html',
  styleUrl: './main-card.scss',
  standalone: true
})
export class MainCard implements OnInit {
  @Input() empresa!: Imobiliaria;
  @Input() cidadeOperacao!: CidadeOperacao;
  @Input() tipoVistoria!: TipoVistoria;
  @Input() buttonText!: string;
  @Output() selecionarCidadeOperacao: EventEmitter<CidadeOperacao> = new EventEmitter<CidadeOperacao>();
  @Output() selecionarTipoVistoria: EventEmitter<TipoVistoria> = new EventEmitter<TipoVistoria>();
  protected currentHost: string = '';

  constructor (@Inject(PLATFORM_ID) private platformId: object) {
  }

  ngOnInit (): void {
    if ( isPlatformBrowser(this.platformId) ) {
      this.currentHost = window.location.host;
      this.currentHost = 'novaimoveispf.sistemaspleno.com';
    }

    console.log(this.buttonText);
  }

  /**
   * Emite o evento de seleção da cidade de operação.
   */
  protected aoSelecionar (): void {
    if ( this.cidadeOperacao ) {
      this.selecionarCidadeOperacao.emit(this.cidadeOperacao);
    } else {
      this.selecionarTipoVistoria.emit(this.tipoVistoria);
    }
  }
}
