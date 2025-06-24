import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { imobiliaria } from '../../../assets/mocks';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SolicitarVistoria } from '../solicitar-vistoria/solicitar-vistoria';
import { formataEnderecoImobiliaria } from '../../common/utils';
import { Imobiliaria } from '../../common/types';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    Header,
    Footer,
    MatDividerModule,
    FontAwesomeModule,
    MatDialogModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  protected currentHost: string = '';
  protected empresa!: Imobiliaria;
  protected readonly formataEnderecoImobiliaria = formataEnderecoImobiliaria;

  constructor (
    @Inject(PLATFORM_ID) private platformId: object,
    private dialog: MatDialog
  ) {
    this.empresa = imobiliaria;
  }

  ngOnInit (): void {
    if ( isPlatformBrowser(this.platformId) ) {
      this.currentHost = window.location.host;
      this.currentHost = 'novaimoveispf.sistemaspleno.com';
    }
  }

  /**
   * Abre um diálogo para solicitar vistoria.
   * @returns {Promise<void>} Retorna uma Promise que resolve quando o diálogo é fechado.
   * @var {MatDialogRef<SolicitarVistoria, any>} dialog Referência ao diálogo aberto.
   * @var {any} result Resultado retornado após o fechamento do diálogo.
   */
  protected async openSolicitarVistoriaDialog (): Promise<void> {
    const dialog: MatDialogRef<SolicitarVistoria, any> = this.dialog.open(SolicitarVistoria, {
      data: {},
      width: 'auto',
      maxWidth: '80vw',
      maxHeight: '90vh',
      height: 'auto',
      panelClass: 'solicitar-vistoria-dialog'
    });

    const result = await firstValueFrom(dialog.afterClosed());
    console.log(result);
  }
}
