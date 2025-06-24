import { Component, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilsService } from './services/utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { SafePipe } from './directives/safe.pipe';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, MatIcon, MatIcon, SafePipe ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'frontend-solicitacoes';
  @ViewChild('templateSnackBar', { static: false }) private templateSnackBar?: TemplateRef<any>;

  constructor (
    private snackbar: MatSnackBar
  ) {
    UtilsService.loadingGeral.subscribe((next) => {
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
}
