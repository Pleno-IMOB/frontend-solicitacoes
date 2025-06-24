import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { BackendService } from '../../services/backend.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './header.html',
  standalone: true,
  styleUrl: './header.scss'
})
export class Header {
  @Input() page: 'agendamento' | 'meus-dados' = 'agendamento';
  protected logoBase?: string;

  constructor (
    protected authService: AuthService,
    private backend: BackendService
  ) {
    this.logoBase = `${this.backend.baseURL}/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Abre um modal de confirmação para logout do usuário.
   * @return Não retorna valor.
   */
  protected openLogoutModal (): void {
    Swal.fire({
      title: 'Deseja realmente sair?',
      text: 'Você será desconectado da sua conta e precisará fazer login novamente para continuar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(async (result: SweetAlertResult): Promise<void> => {
      if ( result.isConfirmed ) {
        await this.authService.logout();
        window.location.reload();
        UtilsService.notifySuccess('Sucesso!', 'Você foi desconectado da sua conta.');
      }
    });
  }

  /**
   * Redireciona o usuário para a página de login.
   */
  protected login (): void {
    window.history.pushState({}, '', ('/agendamento/login'));
  }

  /**
   * Redireciona o usuário para a página "Meus Dados".
   */
  protected redirecionaParaMinhaConta (): void {
    window.history.pushState({}, '', ('/agendamento/meus-dados'));
  }
}
