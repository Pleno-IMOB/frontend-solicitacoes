import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor (
    private authService: AuthService,
    private router: Router
  ) {
  }

  /**
   * Verifica se a rota pode ser ativada com base no estado de autenticação do usuário.
   * @param {ActivatedRouteSnapshot} activatedRoute O snapshot da rota ativada.
   * @param {RouterStateSnapshot} _state O snapshot do estado do roteador.
   * @return {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree} Um Observable, Promise ou valor booleano/UrlTree que determina se a navegação pode continuar.
   */
  canActivate (
    activatedRoute: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if ( !this.authService.authToken ) {
      this.router.navigate([ 'login' ], { queryParams: { returnUrl: this.getResolvedUrl(activatedRoute) } }).then();
      return false;
    } else {
      return this.authService.canActivate(activatedRoute);
    }
  }

  /**
   * Constroi a URL resolvida a partir de um snapshot de rota ativada.
   * @param route Snapshot da rota ativada.
   * @return URL resolvida como uma string.
   */
  getResolvedUrl (route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(v => v.url.map(segment => segment.toString()).join('/'))
      .join('/');
  }
}