import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiData, ErrorBackend } from './interfaces';
import { map } from 'rxjs/operators';
import { IMOBILIARIA } from './common';
import { firstValueFrom } from 'rxjs';
import { isDevMode } from '@angular/core';
import { UtilsService } from '../app/services/utils.service';

export class BackendDefaults {
  public Ip = null;
  public baseURL = '';
  public hostAPI = '';
  public serviceAPI = '';
  public endpoint = 'vistoria';
  public url: string = (!this.isLocalhost) ? 'https://' + window.location.host + '/v2' : `http://${window.location.host}`;
  public urlRaiz: string = (!this.isLocalhost) ? 'https://' + window.location.host : `https://${IMOBILIARIA()}`;
  public urlSistema: string = (!this.isLocalhost) ? window.location.host : IMOBILIARIA();
  public urlUploads = `${this.urlRaiz}/uploads/${this.urlSistema}/`;

  constructor (
    protected http: HttpClient
  ) {
    this.getDomain();
  }

  public get isLocalhost () {
    return !window.location.protocol.includes('https');
  }

  public get hostIsPleno () {
    return window.location.host.includes('plenoimob') || window.location.host.includes('sistemaspleno');
  }

  getIp () {
    return new Promise((resolve) => {
      let ip = null;
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('GET', 'https://api.ipify.org/?format=json');
      xmlhttp.send();
      xmlhttp.onload = function (e) {
        ip = JSON.parse(xmlhttp.response);
        resolve(ip.ip);
      };
    }) as Promise<any>;
  }

  apiGet<T> (endpoint: string, data?: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    return this.get(endpoint, data, callbackErr);
  }

  apiPost<T> (endpoint: string, data?: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    return this.post(endpoint, data, callbackErr);
  }

  apiUpdate<T> (endpoint: string, data: any): Promise<T> {
    return this.update(endpoint, data);
  }

  apiDelete<T> (endpoint: string, data?: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    return this.delete(endpoint, data, callbackErr);
  }

  apiGetExternal<T> (fullUrl: string, data?: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    if ( data ) {
      this.limparDados(data);
      fullUrl += `?${this.serialize(data, false)}`;
    }

    return firstValueFrom(this.http
      .get<ApiData<T>>(fullUrl)  // <- Aqui está a correção
      .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response, null, null, callbackErr))));

  }

  async apiPostExternal<T> (fullUrl: string, data?: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };

    this.limparDados(data);

    return firstValueFrom(
      this.http
        .post<ApiData<T>>(fullUrl, data, options)
        .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response, null, null, callbackErr)))
    );
  }

  async apiUpdateExternal<T> (fullUrl: string, data: any): Promise<T> {
    return firstValueFrom(
      this.http
        .put<ApiData<T>>(fullUrl, data)
        .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response)))
    );
  }

  async apiDeleteExternal<T> (fullUrl: string): Promise<T> {
    return firstValueFrom(
      this.http
        .delete<ApiData<T>>(fullUrl)
        .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response)))
    );
  }

  async apiFormDataPost<T> (
    url: string,
    form: FormData,
    callbackErr?: (error: ErrorBackend) => void
  ): Promise<T> {
    return firstValueFrom(
      this.http
        .post<ApiData<T>>(`${this.baseURL}/${url}`, form)
        .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response, null, null, callbackErr)))
    );
  }

  public serialize (obj: any, prefix: any): any {
    const str = [];
    for ( const p in obj ) {
      if ( obj.hasOwnProperty(p) ) {
        const k = prefix ? `${prefix}[${p}]` : p;
        const v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
          this.serialize(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return str.join('&');
  }

  refreshToken<T> (token: string, endpoint: string, parameters = {}) {
    const options = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    };

    const params = {
      auth_token: token,
      ...parameters
    };

    this.limparDados(params);
    return this.http
      .post<ApiData<T>>(`${this.baseURL}/${endpoint}`, this.serialize(params, false), options)
      .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response, null, null, () => {
        console.log('deu ruim parceiro');
      })));
  }

  /**
   * Configura as URLs baseadas no ambiente de execução e redireciona se necessário.
   * @return Não retorna valor, mas pode lançar um erro ao redirecionar.
   */
  public getDomain (): void {
    if ( this.baseURL ) {
      return;
    }

    if ( this.isLocalhost && isDevMode() ) {
      const base = 'https://api.sistemaspleno-homolog.com';
      this.baseURL = `${base}/api/${this.endpoint}`;
      this.hostAPI = `${base}/api/`;
      this.serviceAPI = `${base}/api/`;
    } else {
      const rootDomain = this.rootDomain(window.location.hostname);
      let domain: string;
      if ( rootDomain === 'sistemaspleno-homolog.com' ) {
        domain = 'sistemaspleno-homolog.com';
      } else {
        domain = 'sistemaspleno.com';
      }
      const protocol = this.isLocalhost ? 'http' : 'https';

      this.baseURL = `${protocol}://api.${domain}/api/${this.endpoint}`;
      this.hostAPI = `${protocol}://api.${domain}/api/`;
      this.serviceAPI = `${protocol}://services.${domain}/api/`;

      const currentHost = this.getDomainFromURL();
      if ( currentHost !== domain ) {
        const url = window.location.href;
        window.location.href = url.replace(currentHost, domain);
        throw new Error('Redirecionando');
      }
    }
  }

  protected get<T> (url: string, data?: any, callbackErr?: (error: ErrorBackend) => void) {
    if ( data ) {
      this.limparDados(data);
      url += `?${this.serialize(data, false)}`;
    }

    return firstValueFrom(
      this.http
        .get<ApiData<T>>(`${this.baseURL}/${url}`)
        .pipe(map((response: ApiData<T>) =>
          this.tratarRetorno<T>(response, null, null, callbackErr)
        ))
    );
  }

  protected async post<T> (url: string, params: any, callbackErr?: (error: ErrorBackend) => void): Promise<T> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };

    this.limparDados(params);

    return firstValueFrom(
      this.http
        .post<ApiData<T>>(`${this.baseURL}/${url}`, params, options)
        .pipe(map((response: ApiData<T>) =>
          this.tratarRetorno<T>(response, null, null, callbackErr)
        ))
    );
  }

  protected async update<T> (url: string, params: any): Promise<T> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };

    this.limparDados(params);

    return firstValueFrom(
      this.http
        .put<ApiData<T>>(`${this.baseURL}/${url}`, params, options)
        .pipe(map((response: ApiData<T>) => this.tratarRetorno<T>(response)))
    );
  }

  protected async delete<T> (
    url: string,
    params?: any,
    callbackErr?: (error: ErrorBackend) => void
  ): Promise<T> {
    if ( params ) {
      this.limparDados(params);
      url += `?${this.serialize(params, false)}`;
    }

    return firstValueFrom(
      this.http
        .delete<ApiData<T>>(`${this.baseURL}/${url}`)
        .pipe(map((response: ApiData<T>) =>
          this.tratarRetorno<T>(response, null, null, callbackErr)
        ))
    );
  }

  /**
   * Trata a resposta de uma requisição, retornando dados em caso de sucesso ou manipulando erros.
   * @param {ApiData} response - A resposta da API a ser tratada.
   * @param {string} [title=null] - O título opcional para a mensagem de erro.
   * @param {string} [text=null] - O texto opcional para a mensagem de erro.
   * @param {function(ErrorBackend): void} [callbackErr=null] - Função de callback para tratar erros específicos.
   * @returns {any} Retorna os dados da resposta em caso de sucesso.
   * @throws {ErrorBackend} Lança um erro com detalhes se a resposta indicar falha.
   */
  protected tratarRetorno<T> (response: ApiData<T>, title?: string | null, text?: string | null, callbackErr?: (error: ErrorBackend) => void): any {
    const defaults = {
      title: 'Algo deu errado 😅😬',
      text: 'Ocorreu um erro na comunicação com o servidor, tente novamente em alguns instantes.'
    };

    if ( response.success ) {
      return response.data;
    } else {
      if ( response.error.code === 6969 )
        window.location.href = `${this.url}/pendenciaFinanceira`;

      if ( response.error.code === 859 ) {
        localStorage.clear();
        window.location.href = `${this.url}/`;
        throw new Error(('Erro session!!!'));
      }

      // Somente mostra o erro caso não tiver callback
      if ( callbackErr ) {
        callbackErr(response.error);
      } else {
        UtilsService.carregandoGeral(false);
        UtilsService.carregando(false);
        if ( response?.error?.message )
          defaults.text += `<br><br><small><strong>${response.error.message}</strong></small>`;

        if ( response.error.validation ) {
          defaults.text += '<br>';
          for ( const key in response.error.validation ) {
            const validation = response.error.validation[key];
            defaults.text += `<br><small><strong>${validation[0]}</strong></small>`;
          }
        }

        UtilsService.mostrarErro({ title: title || defaults.title, text: response.error.message || text || defaults.text });
        throw (response.error);
      }
    }
  }

  protected limparDados (objeto: any) {
    for ( const propriedade in objeto ) {
      if ( objeto[propriedade] === undefined || objeto[propriedade] === null ) {
        objeto[propriedade] = '';
      } else if ( objeto[propriedade] === false || objeto[propriedade] === 'false' ) {
        objeto[propriedade] = 0;
      } else if ( objeto[propriedade] === true || objeto[propriedade] === 'true' ) {
        objeto[propriedade] = 1;
      } else if ( typeof objeto[propriedade] === 'object' ) {
        this.limparDados(objeto[propriedade]);
      }
    }
  }

  /**
   * Returns the domain from the current URL.
   *
   * @private
   * @returns {string} The domain of the current URL.
   */
  private getDomainFromURL (): string {
    const url = window.location.hostname;
    const partes = url.split('.');
    partes.shift();
    return partes.join('.');
  }

  /**
   * Returns the root domain of a given hostname.
   * @param {string} hostname - The hostname to extract the root domain from.
   * @return {string} - The root domain of the hostname.
   */
  private rootDomain (hostname: string): string {
    let parts = hostname.split('.');
    if ( parts.length <= 2 )
      return hostname;

    parts = parts.slice(-3);
    if ( [ 'co', 'com' ].indexOf(parts[1]) > -1 )
      return parts.join('.');

    return parts.slice(-2).join('.');
  }
}
