import { Injectable } from '@angular/core';
import {Usuario} from '../common/types';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public usuarioIsLogged: boolean = false;
  public usuario!: Usuario;

  public setUsuario(usuario: Usuario, isLogged: boolean = true): void {
    this.usuario = usuario;
    this.usuarioIsLogged = isLogged;
  }

  public getUsuario(): Usuario | null {
    return this.usuario ?? null;
  }

  public isLogged(): boolean {
    return this.usuarioIsLogged;
  }

  public clearUsuario(): void {
    this.usuario = {} as Usuario;
    this.usuarioIsLogged = false;
  }
}
