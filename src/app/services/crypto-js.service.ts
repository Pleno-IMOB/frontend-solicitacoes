import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoJSService {
  private PassPhrase = 'É um país da Europa, o idioma é o holandês';

  private CryptoJSAesJson = {
    stringify: (cipherParams: any) => {
      let j: any = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
      if (cipherParams.iv) j.iv = cipherParams.iv.toString();
      if (cipherParams.salt) j.s = cipherParams.salt.toString();
      return JSON.stringify(j);
    },
    parse: (jsonStr: any) => {
      let j: any = JSON.parse(jsonStr);
      let cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(j.ct) });
      if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
      if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
      return cipherParams;
    }
  }

  constructor() { }


  encrypt(data: any) {
    return btoa(CryptoJS.AES.encrypt(JSON.stringify(data), this.PassPhrase, { format: this.CryptoJSAesJson }).toString());
  }

  decrypt(data: any) {
    try {
      return JSON.parse(CryptoJS.AES.decrypt(atob(data), this.PassPhrase, {format: this.CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
