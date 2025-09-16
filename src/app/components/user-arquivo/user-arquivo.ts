import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AnexoInterface } from '../../common/types';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-arquivo',
  imports: [
    MatIconModule
  ],
  templateUrl: './user-arquivo.html',
  styleUrl: './user-arquivo.scss',
  standalone: true
})
export class UserArquivo {
  @Input() anexo!: AnexoInterface;
  @Input() index?: number;

  constructor (
    protected authService: AuthService
  ) {
  }

  /**
   * Abre o arquivo anexo em uma nova aba do navegador.
   * @param anexo - Objeto que contém as informações do anexo, incluindo a URL.
   */
  protected openArquivo (): void {
    if ( this.anexo ) {
      window.open(this.anexo.url, '_blank');
    }
  }
}
