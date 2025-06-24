import { Injectable } from '@angular/core';
import VMasker from 'vanilla-masker';

@Injectable({ providedIn: 'root' })
export class MascaraService {
  inteiro = (v: string) => v ? VMasker.toMoney(v || '', { unit: '', precision: 0 }) : '';
  inteiroSemPontos = (v: string) => v ? Number(VMasker.toNumber(v || '')) : '';
  percentual = (v: string) => VMasker.toMoney(v || '', { unit: '', precision: 1 });
  valor = (v: string) => VMasker.toMoney(v || '', { unit: '', precision: 2 });
  dinheiro = (v: string) => VMasker.toMoney(v || '', { unit: 'R$', precision: 2 });
  cpf = (v: string) => VMasker.toPattern(v || '', '999.999.999-99');
  cnpj = (v: string) => VMasker.toPattern(v || '', '99.999.999/9999-99');
  cpfCnpj = (v: string) => ((v || '').replace(/[^\d]/g, '').length <= 11 ? this.cpf(v) : this.cnpj(v));
  celularDDD = (v: string) => VMasker.toPattern(v || '', '(99) 99999-9999');
  telefoneDDD = (v: string) => {
    v = (v || '').replace(/[^\d]/g, '');
    return VMasker.toPattern(v || '', v.length === 11 ? '(99) 99999-9999' : '(99) 9999-9999');
  };
  telefoneDDIDDD = (v: string) => {
    v = (v || '').replace(/[^\d]/g, '');
    return VMasker.toPattern(v || '', v.length === 13 ? '+99 (99) 99999-9999' : '+99 (99) 9999-9999');
  };
  usuario = (v: string) => (typeof v === 'string' && v.replace(/[^\d\.\w]/, '').toLocaleLowerCase()) || '';
  DDD = (v: string) => VMasker.toPattern(v || '', '99');
  celular = (v: string) => VMasker.toPattern(v || '', '99999-9999');
  cep = (v: string) => VMasker.toPattern(v || '', '99999-999');
  data = (v: string) => VMasker.toPattern(v || '', '99/99/9999');
  mesAno = (v: string) => VMasker.toPattern(v || '', '99/9999');
  dataHora = (v: string) => VMasker.toPattern(v || '', '99/99/9999 99:99:99');
  horaMinSeg = (v: string) => VMasker.toPattern(v || '', '99:99:99');
  horaMin = (v: string) => VMasker.toPattern(v || '', '99:99');
  horaCompostaMin = (v: string) => {
    if ( !v ) {
      return '';
    }

    v = v.replace(/\D/g, '');
    v = v.slice(0, 5);
    if ( v.length > 2 ) {
      v = v.slice(0, v.length - 2) + ':' + v.slice(-2);
    }
    return v;
  };
  padrao = (padrao: string) => (v: string) => VMasker.toPattern(v, padrao);
  maiusculo = (v: string) => {
    if ( v != null && v != 'null' ) {
      return v.toUpperCase();
    }
    return '';
  };
}
