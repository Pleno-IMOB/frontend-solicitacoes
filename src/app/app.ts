import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilsService } from './services/utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { SafePipe } from './directives/safe.pipe';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, MatIcon, MatIcon, SafePipe ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  protected title: string = 'frontend-solicitacoes';
  @ViewChild('templateSnackBar', { static: false }) private templateSnackBar?: TemplateRef<any>;
  private erroSub!: Subscription;

  constructor (
    private snackbar: MatSnackBar,
    private toastr: ToastrService
  ) {

    UtilsService.toastr = this.toastr;
    this.showLoadingSnackBar();
    this.showErrorGeralModal();
  }

  /**
   * Cancela a inscrição do erroSub.
   */
  ngOnDestroy (): void {
    this.erroSub.unsubscribe();
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
