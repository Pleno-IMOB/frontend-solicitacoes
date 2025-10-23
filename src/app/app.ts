import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilsService } from './services/utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { SafePipe } from './directives/safe.pipe';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { BackendService } from './services/backend.service';
import { ImobiliariaInterface } from './common/types';
import { ImobiliariaInterfaceService } from './services/imobiliaria.service';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, MatIcon, MatIcon, SafePipe ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected title: string = 'frontend-solicitacoes';
  protected imobiliaria: ImobiliariaInterface | null = null;
  @ViewChild('templateSnackBar', { static: false }) private templateSnackBar?: TemplateRef<any>;
  private erroSub!: Subscription;

  constructor (
    private snackbar: MatSnackBar,
    private toastr: ToastrService,
    private titleService: Title,
    private backend: BackendService,
    private imobiliariaService: ImobiliariaInterfaceService
  ) {
    UtilsService.toastr = this.toastr;
    this.showLoadingSnackBar();
    this.showErrorGeralModal();
  }

  /**
   * Inicializa o componente carregando a imobiliária.
   * @return {Promise<void>}
   */
  async ngOnInit (): Promise<void> {
    this.imobiliaria = await this.imobiliariaService.getEmpresa();

    if ( this.backend.isHostAberto ) {
      this.trocaLogoParaVdv();
    } else {
      this.trocaLogoParaPleno();
    }
  }

  /**
   * Cancela a inscrição do erroSub.
   */
  ngOnDestroy (): void {
    this.erroSub.unsubscribe();
  }

  /**
   * Atualiza o título da página e o favicon para a interface de vistorias.
   */
  private trocaLogoParaVdv (): void {
    this.titleService.setTitle('VDV - Conexão');
    this.setFavicon('assets/images/favicon-vdv.png');
  }

  /**
   * Atualiza o título da página e o favicon para a interface de vistorias.
   */
  private trocaLogoParaPleno (): void {
    this.titleService.setTitle(`${this.imobiliaria?.imob_empresa} - Solicite sua vistoria`);
    this.setFavicon('assets/images/favicon.ico');
  }

  /**
   * Atualiza o favicon da página com o URL do ícone fornecido.
   * @param iconUrl URL do ícone a ser usado como favicon
   */
  private setFavicon (iconUrl: string): void {
    const link: HTMLLinkElement | null = document.querySelector('link[rel*=\'icon\']');
    if ( link ) {
      link.href = iconUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = iconUrl;
      document.head.appendChild(newLink);
    }
  }

  /**
   * Exibe ou oculta o SnackBar de carregamento com base no estado de `loadingGeral`.
   * @private
   */
  private showLoadingSnackBar (): void {
    UtilsService.loadingGeral.subscribe((next: boolean): void => {
      if ( next && this.templateSnackBar ) {
        this.snackbar.openFromTemplate(this.templateSnackBar, {
          data: {
            message: UtilsService.loadingGeralMsg.value,
            icon: 'loop'
          }
        });
      } else {
        this.snackbar.dismiss();
      }
    });
  }

  /**
   * Exibe um modal de erro geral utilizando o SweetAlert2.
   * @private
   */
  private showErrorGeralModal (): void {
    this.erroSub = UtilsService.erro.subscribe((erro: any): void => {
      if ( erro ) {
        this.snackbar.dismiss();
        Swal.fire({
          html: `<h3>${erro.title}</h3><br><h4>${erro.text}.</h4>`,
          icon: 'error',
          focusCancel: true,
          customClass: { confirmButton: 'btn btn-warning' },
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then();
      }
    });
  }
}
