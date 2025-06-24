import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UtilsService } from './utils.service';
import { HttpClient } from '@angular/common/http';
import { BackendService } from './backend.service';
import { AuthServiceUsuario } from '../common/types';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public permissoesCarregadas = false;
  private sufixStorage = 'vistoria_agendamento';
  private keyUserStorage = `usuario_${this.sufixStorage}`;
  private keyPermissoesStorage = `permissoes_${this.sufixStorage}`;
  private keyToken = `auth_token_${this.sufixStorage}`;
  private permissoes$ = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(this.keyPermissoesStorage) ?? 'null'));
  private usuario$ = new BehaviorSubject<AuthServiceUsuario | null>(
    JSON.parse(localStorage.getItem(this.keyUserStorage) ?? 'null')
  );
  private authToken$ = new BehaviorSubject<string | null>(localStorage.getItem(this.keyToken) || null);

  constructor (
    private route: Router,
    public http: HttpClient,
    private backend: BackendService
  ) {
  }

  /**
   * Retrieves the usuario value.
   * @returns {any} The usuario value.
   */
  public get usuario (): BehaviorSubject<AuthServiceUsuario | null> {
    return this.usuario$;
  }

  /**
   * Retorna o valor atual do token de autenticação.
   * @return O token de autenticação atual como uma string.
   */
  public get authToken (): string | null {
    return this.authToken$?.value || this.usuario$.value?.auth_token || null;
  }

  /**
   * Atualiza o token de autenticação e salva o novo token no armazenamento local.
   * @param newToken O novo token de autenticação que será configurado e armazenado.
   */
  public set authToken (newToken: string) {
    this.authToken$.next(newToken);
    localStorage.setItem(this.keyToken, newToken);
  }

  /**
   * Retrieves the permissions stored in the 'permissoes$' property.
   * @returns {Array} An array containing the permissions.
   */
  public get permissoes (): any {
    return this.permissoes$;
  }

  /**
   * Set the permissions.
   * @param {any} v - The new value for permissions.
   */
  public set permissoes (v: any) {
    this.permissoes$.next(v);
  }

  /**
   * Updates the user data and sets the user as authenticated.
   * @param {Usuario} v - The updated user data.
   * @return {Usuario} - The updated user data.
   */
  public async atualizarUsuario (v: AuthServiceUsuario): Promise<AuthServiceUsuario> {
    if ( v.auth_token ) {
      this.authToken = v.auth_token;
      delete v?.auth_token;
    }

    if ( v.permissoes && v?.permissoes?.length > 0 ) {
      this.permissoes$.next(v?.permissoes || []);
      localStorage.setItem(this.keyPermissoesStorage, JSON.stringify(v?.permissoes || []));
      delete v?.permissoes;
      this.permissoesCarregadas = true;
    }

    localStorage.setItem(this.keyUserStorage, JSON.stringify(v));
    
    this.usuario$.next(v);
    return v;
  }

  /**
   * Logs out the user, clears local storage and removes chat.
   * @return {Promise<boolean>} A promise that resolves with true when the logout is successful.
   */
  public async logout (): Promise<boolean> {
    this.permissoes$.next(null);
    this.authToken$.next(null);
    this.usuario$.next(null);
    localStorage.clear();
    return true;
  }

  /**
   * Checks if the user has permission to access a specific route.
   * @param {ActivatedRouteSnapshot} activatedRoute - The activated route snapshot object.
   * @return {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has permission.
   */
  public async canActivate (activatedRoute: ActivatedRouteSnapshot): Promise<boolean> {
    UtilsService.carregandoGeral(true);

    if ( !this.permissoesCarregadas ) {
      const user = await this.backend.apiGet<AuthServiceUsuario>('usuario/profile', { includePermissions: true });
      await this.atualizarUsuario(user);
      this.permissoesCarregadas = true;
    }
    UtilsService.carregandoGeral(false);

    let retorno: boolean;
    retorno = (activatedRoute?.data?.['controlador'] && activatedRoute?.data?.['permissao']) ? this.havePermission(activatedRoute.data?.['controlador'], activatedRoute.data?.['permissao']) : true;
    if ( !retorno ) {
      await this.route.navigateByUrl('/403');
    }
    return retorno;
  }

  /**
   * Clears the storage by removing all items from localStorage and setting isAuthenticated to false.
   *
   * @returns {void}
   */
  public clearStorage (): void {
    this.allStorage().forEach((item) => localStorage.removeItem(item));
  }

  /**
   * Checks if the current user has permission to access a specific module and permission.
   * @param {String} modulo - The module name to check permission for.
   * @param {any} permissao - The permission to check for the given module.
   * @return {boolean} - Returns `true` if the user has the specified permission for the module, otherwise returns `false`.
   */
  private havePermission (modulo: String, permissao: any): boolean {
    if ( this.usuario$.value ) {
      if ( this.permissoes.value ) {
        for ( const mod of this.permissoes.value ) {
          if ( mod.mod_controlador === modulo ) {
            if ( mod.permissoes && mod.permissoes[permissao] && (mod.permissoes[permissao] === 'S' || mod.permissoes[permissao] === true) ) {
              return true;
            }
          }
        }
        return false;
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * Retrieves all keys from the localStorage that contain the specified string.
   * @returns {string[]} An array of strings representing the keys containing the specified string.
   */
  private allStorage (): string[] {
    const storage = Object.entries(localStorage);
    const values = [];
    for ( const item of storage ) {
      const key = String(item[0]);
      if ( key.includes(`_${this.sufixStorage}`) )
        values.push(key);
    }
    return values;
  }
}