import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor (
    private backend: BackendService
  ) {
  }

  /**
   * Busca o nome de uma pessoa pelo CNPJ.
   * @param cnpj - CNPJ da pessoa a ser buscada
   * @param host - Host utilizado na requisição
   * @returns Nome da pessoa ou null se não encontrado
   */
  public async buscarPorCnpj (cnpj: string, host: string): Promise<any> {
    if ( cnpj.length !== 18 ) return;
    const response: any = await this.backend.apiGet(`pessoa/buscaPorCnpj?pes_cnpj=${cnpj}&sis_codigo=6&host=${host}`, null, (): string | null => {
      return null;
    });
    if ( response ) {
      return response?.pes_nome;
    } else {
      return null;
    }
  }

  /**
   * Busca o nome de uma pessoa pelo CPF.
   * @param cpf - CPF da pessoa a ser buscada
   * @param host - Host utilizado na requisição
   * @returns Nome da pessoa ou null se não encontrado
   */
  public async buscarPorCpf (cpf: string, host: string): Promise<any> {
    if ( cpf.length !== 14 ) return;
    const response: any = await this.backend.apiGet(`pessoa/validarCpf?pes_cpf=${cpf}&sis_codigo=6&host=${host}`, null, (): string | null => {
      return null;
    });
    if ( response ) {
      return response[0]?.pessoa?.pes_nome;
    } else {
      return null;
    }
  }
}