import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Imobiliaria } from '../../common/types';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuTrigger,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './header.html',
  standalone: true,
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  protected empresa?: Imobiliaria;
  protected logoUsuario?: string;
  protected user?: any;

  constructor (
    private authService: AuthService,
    private backend: BackendService,
    private router: Router
  ) {
    this.logoUsuario = `${this.backend.baseURL}/logo-imobiliaria?host=${this.backend.urlSistema}`;
  }

  /**
   * Inicializa o componente e subscreve ao serviço de autenticação para obter o usuário atual.
   * @return Promessa que resolve quando a inicialização é concluída.
   */
  async ngOnInit () {
    this.authService.usuario.subscribe((next) => this.user = next);
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
        await this.router.navigateByUrl('/login ');
      }
    });
  }
}