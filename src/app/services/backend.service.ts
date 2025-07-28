import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BackendDefaults } from '../common/backend';

@Injectable({
  providedIn: 'root'
})
export class BackendService extends BackendDefaults {
  public override Ip = null;
  public override endpoint = 'agendamento';
  public override url: string = (!this.isLocalhost) ? 'https://' + window.location.host + '/agendamento' : `http://${window.location.host}`;
  public override urlRaiz: string = (!this.isLocalhost) ? 'https://' + window.location.host : 'https://apresentacao.plenoimob.com.br';
  public override urlSistema: string;
  public override urlUploads: string;

  constructor (
    @Inject('INTERCEPTOR_HOST') interceptorHost: string,
    public override http: HttpClient
  ) {
    super(http);
    this.urlSistema = interceptorHost;
    this.urlUploads = `${this.urlRaiz}/uploads/${this.urlSistema}/`;
    (async (): Promise<void> => {
      this.Ip = await this.getIp();
    })();

    (async (): Promise<void> => {
      this.Ip = await this.getIp();
    })();
  }
}
