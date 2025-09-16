import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthServicePessoaInterface } from '../common/types';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public permissoesCarregadas = false;
  private sufixStorage = 'vistoria_agendamento';
  private keyUserStorage = `pessoa_${this.sufixStorage}`;
  private keyPermissoesStorage = `permissoes_${this.sufixStorage}`;
  private keyToken = `auth_token_${this.sufixStorage}`;
  private permissoes$ = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(this.keyPermissoesStorage) ?? 'null'));
  private pessoa$ = new BehaviorSubject<AuthServicePessoaInterface | null>(
    JSON.parse(localStorage.getItem(this.keyUserStorage) ?? 'null')
  );
  private authToken$ = new BehaviorSubject<string | null>(localStorage.getItem(this.keyToken) || null);

  constructor (
    public http: HttpClient
  ) {
  }

  /**
   * Retrieves the usuario value.
   * @returns {any} The usuario value.
   */
  public get pessoa (): BehaviorSubject<AuthServicePessoaInterface | null> {
    return this.pessoa$;
  }

  /**
   * Retorna o valor atual do objeto pessoa.
   * @return {AuthServicePessoaInterface | null} O valor atual de pessoa ou null se não estiver definido.
   */
  public get pessoaValue (): AuthServicePessoaInterface | null {
    return this.pessoa$.value;
  }

  /**
   * Retorna o valor atual do token de autenticação.
   * @return O token de autenticação atual como uma string.
   */
  public get authToken (): string | null {
    return this.authToken$?.value || this.pessoa$.value?.auth_token || null;
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
   * Updates the user data and sets the user as authenticated.
   * @param {UsuarioInterface} v - The updated user data.
   * @return {UsuarioInterface} - The updated user data.
   */
  public async atualizarPessoa (v: AuthServicePessoaInterface): Promise<AuthServicePessoaInterface> {
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

    this.pessoa$.next(v);
    return v;
  }

  /**
   * Logs out the user, clears local storage and removes chat.
   * @return {Promise<boolean>} A promise that resolves with true when the logout is successful.
   */
  public async logout (): Promise<boolean> {
    this.permissoes$.next(null);
    this.authToken$.next(null);
    this.pessoa$.next(null);
    localStorage.clear();
    return true;
  }

  /**
   * Clears the storage by removing all items from localStorage and setting isAuthenticated to false.
   * @returns {void}
   */
  public clearStorage (): void {
    this.allStorage().forEach((item) => localStorage.removeItem(item));
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