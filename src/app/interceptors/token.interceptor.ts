import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { BackendService } from '../services/backend.service';
import { APP_BASE_HREF } from '@angular/common';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Intercepta requisições HTTP e adiciona um cabeçalho de autorização, lidando com erros 401.
 * @param request Requisição HTTP a ser interceptada.
 * @param next Função manipuladora que processa a requisição.
 * @return Observable que emite eventos HTTP ou trata erros de autenticação.
 */
export function interceptToken (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService: AuthService = inject(AuthService);
  const backendService: BackendService = inject(BackendService);
  const token: string | undefined = authService.authToken || authService.pessoa?.value?.auth_token;
  if ( token ) {
    request = addTokenHeader(request, token);
  }
  return next(request).pipe(
    catchError(error => {
      if ( error instanceof HttpErrorResponse && error.status === 401 ) {
        return handle401Error(
          request,
          next,
          authService,
          backendService,
          refreshTokenSubject,
          { value: isRefreshing }
        );
      }
      return throwError(() => error);
    })
  );
}

/**
 * Adiciona um cabeçalho de autorização à requisição HTTP.
 * @param request Requisição HTTP original.
 * @param token Token de autenticação a ser adicionado.
 * @return Nova requisição HTTP com o cabeçalho de autorização.
 */
function addTokenHeader (request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({ setHeaders: { Authorization: 'Basic ' + token } });
}

/**
 * Trata erros de autenticação 401, tentando atualizar o token e repetir a requisição.
 * @param request Requisição HTTP original que falhou.
 * @param next Função manipuladora que processa a requisição.
 * @param authService Serviço de autenticação para gerenciar tokens.
 * @param backendService Serviço de backend para operações de atualização de token.
 * @param refreshTokenSubject Sujeito que emite o novo token após a atualização.
 * @param isRefreshingRef Referência ao estado de atualização do token.
 * @return Observable que emite a nova requisição ou um erro se a atualização falhar.
 */
function handle401Error (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  backendService: BackendService,
  refreshTokenSubject: BehaviorSubject<string | null>,
  isRefreshingRef: { value: boolean }
): Observable<any> {
  if ( !isRefreshingRef.value ) {
    isRefreshingRef.value = true;
    refreshTokenSubject.next(null);
    const token = authService.authToken;

    if ( token ) {
      return backendService.refreshToken(token, 'login/refreshToken').pipe(
        switchMap((data: any) => {
          const clone = request.clone({ setHeaders: { Authorization: 'Basic ' + data } });
          refreshTokenSubject.next(data);
          isRefreshingRef.value = false;
          authService.authToken = data;
          return next(clone);
        }),
        catchError((err) => {
          isRefreshingRef.value = false;
          authService.logout().then();
          const baseHref = inject(APP_BASE_HREF);
          window.history.pushState({}, '', `${baseHref}login`);
          return throwError(() => err);
        })
      );
    } else {
      const baseHref = inject(APP_BASE_HREF);
      window.history.pushState({}, '', `${baseHref}login`);
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => {
      const clone = request.clone({ setHeaders: { Authorization: 'Basic ' + token } });
      return next(clone);
    })
  );
}