import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoJSService {
  private PassPhrase = 'É um país da Europa, o idioma é o holandês';

  /**
   * Objeto para manipulação de criptografia AES em formato JSON.
   * @property {Function} stringify - Converte parâmetros de cifra em uma string JSON.
   * @property {Function} parse - Converte uma string JSON em parâmetros de cifra.
   */
  private CryptoJSAesJson = {
    stringify: (cipherParams: any) => {
      let j: any = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
      if ( cipherParams.iv ) j.iv = cipherParams.iv.toString();
      if ( cipherParams.salt ) j.s = cipherParams.salt.toString();
      return JSON.stringify(j);
    },
    parse: (jsonStr: any) => {
      let j: any = JSON.parse(jsonStr);
      let cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(j.ct) });
      if ( j.iv ) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
      if ( j.s ) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
      return cipherParams;
    }
  };

  /**
   * Criptografa os dados fornecidos usando AES e retorna uma string codificada em Base64.
   * @param {any} data - Dados a serem criptografados.
   * @returns {string} - String criptografada em Base64.
   */
  encrypt (data: any) {
    return btoa(CryptoJS.AES.encrypt(JSON.stringify(data), this.PassPhrase, { format: this.CryptoJSAesJson }).toString());
  }

  /**
   * Descriptografa uma string codificada em Base64 usando AES.
   * @param {any} data - Dados criptografados a serem descriptografados.
   * @returns {any|boolean} - Retorna os dados descriptografados ou false em caso de erro.
   */
  decrypt (data: any) {
    try {
      return JSON.parse(CryptoJS.AES.decrypt(atob(data), this.PassPhrase, { format: this.CryptoJSAesJson }).toString(CryptoJS.enc.Utf8));
    } catch ( e ) {
      console.error(e);
      return false;
    }
  }
}