import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { ImobiliariaInterfaceService } from '../../services/imobiliaria.service';
import { ImobiliariaInterface } from '../../common/types';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-footer',
  imports: [
    FontAwesomeModule,
    MatIconModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer implements OnInit {
  @Input() logoEmpresa!: string;
  protected imobiliaria: ImobiliariaInterface | null = null;
  protected defaultImage = 'assets/images/lazy.gif';

  constructor (
    private imobiliariaService: ImobiliariaInterfaceService,
    protected backend: BackendService
  ) {
  }

  /**
   * Formata o telefone removendo todos os caracteres não numéricos.
   * @returns {string} O telefone formatado contendo apenas números.
   */
  get telefoneFormatado (): string {
    const telefoneOriginal = this.imobiliaria?.imob_telefone_wpp || '';
    return telefoneOriginal.replace(/\D+/g, '');
  }

  /**
   * Inicializa o componente carregando os dados da imobiliária.
   * @returns {Promise<void>} Promessa que resolve quando a inicialização estiver completa.
   */
  async ngOnInit (): Promise<void> {
    this.imobiliaria = await this.imobiliariaService.getEmpresa();
  }
}