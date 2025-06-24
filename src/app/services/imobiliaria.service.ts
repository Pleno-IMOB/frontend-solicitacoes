import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { Imobiliaria } from '../common/types';

@Injectable({
  providedIn: 'root'
})
export class ImobiliariaService {
  private imobiliaria$?: Imobiliaria;

  constructor (
    private backend: BackendService
  ) {
  }

  /**
   * Recupera informações da empresa de imobiliária.
   * @return {Promise<Imobiliaria>} Promessa que resolve com os dados da imobiliária.
   */
  public async getEmpresa (): Promise<Imobiliaria> {
    if ( !this.imobiliaria$ ) {
      this.imobiliaria$ = await this.backend.apiGet('imobiliaria');
    }
    return this.imobiliaria$;
  }
}