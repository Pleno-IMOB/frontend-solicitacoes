import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { ImobiliariaInterface } from '../common/types';

@Injectable({
  providedIn: 'root'
})
export class ImobiliariaInterfaceService {
  private imobiliaria$?: ImobiliariaInterface;

  constructor (
    private backend: BackendService
  ) {
  }

  /**
   * Recupera informações da empresa de imobiliária.
   * @return {Promise<ImobiliariaInterface>} Promessa que resolve com os dados da imobiliária.
   */
  public async getEmpresa (): Promise<ImobiliariaInterface> {
    if ( !this.imobiliaria$ ) {
      this.imobiliaria$ = await this.backend.apiGetExternal(`${this.backend.hostAPI}vistoria/imobiliaria/indexComHost`, { host: this.backend.urlSistema });
    }
    return this.imobiliaria$;
  }
}