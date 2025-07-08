import { FormGroup } from '@angular/forms';
import format from 'format-number';
import { DataConfig } from './types';

export function removeAcento (text: any) {
  if ( text ) {
    text = text.toLowerCase();
    text = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
    text = text.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
    text = text.replace(new RegExp('[Ç]', 'gi'), 'c');
    return text.replace(/'/g, '`');
  } else {
    return text;
  }
}

export function limparDados (objeto: any, cfg: DataConfig = {} as DataConfig, removeEmptyArray = false) {
  for ( const propriedade in objeto ) {
    if ( objeto.hasOwnProperty(propriedade) && objeto[propriedade] === undefined || objeto[propriedade] === null || objeto[propriedade] === 'null' ) {
      objeto[propriedade] = '';
    } else if ( objeto[propriedade] === false || objeto[propriedade] === 'false' ) {
      objeto[propriedade] = 0;
    } else if ( objeto[propriedade] === true || objeto[propriedade] === 'true' ) {
      objeto[propriedade] = 1;
    } else if ( typeof objeto[propriedade] === 'string' && cfg?.toUpper === true && !((cfg?.toUpperIgnored || []).includes(propriedade)) ) {
      objeto[propriedade] = objeto[propriedade].toUpperCase();
    } else if ( typeof objeto[propriedade] === 'object' ) {
      if ( removeEmptyArray && Array.isArray(objeto[propriedade]) && objeto[propriedade].length <= 0 )
        delete objeto[propriedade];
      else
        limparDados(objeto[propriedade], cfg, removeEmptyArray);
    }
  }
}

export function imprimir (html = null, landscape = false) {
  const win = window.open('', 'blank');
  if ( win ) {
    win.document.head.innerHTML = document.head.innerHTML.replace(`href="/`, `href="${window.location.protocol}//${window.location.host}/`);

    if ( !html ) {
      const shows: any = document.body.getElementsByClassName('show-in-print');
      if ( shows.length )
        for ( let i = 0; i < shows.length; i++ )
          shows[i].style.display = 'block';

      win.document.body.innerHTML = document.getElementById('printable')?.innerHTML || '';

      if ( shows.length )
        for ( let i = 0; i < shows.length; i++ )
          shows[i].style.display = 'none';
    } else {
      win.document.body.innerHTML = html;
    }

    if ( landscape )
      win.document.head.innerHTML += '<style>@media print { @page { size: landscape } }</style>';

    const printFunction = function () {
      setTimeout(() => {
        win.onafterprint = function () {
          win.close();
        };
        win.print();
      }, 1000);
    };

    setTimeout(() => {
      printFunction();
    }, 1000);
  }
}

export function findObjectByKey (array: any, key: any, value: any) {
  for ( let i = 0; i < array.length; i++ ) {
    if ( array[i][key] === value )
      return array[i];
  }

  return null;
}

export function abrirPdfNovaAba (title: string, content: string) {
  const w = window.open('about:blank');
  if ( w ) {
    w.document.title = title;

    const iframe = w.document.createElement('iframe') as HTMLIFrameElement;
    iframe.setAttribute('style', 'position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;');
    iframe.src = `data:application/pdf;base64,${content}`;

    setTimeout(function () { // FireFox
      w.document.body.appendChild(iframe);
    }, 0);

    return false;
  }
  return true;
}

export function serialize (obj: any, prefix: any): any {
  const str = [];
  for ( const p in obj ) {
    if ( obj.hasOwnProperty(p) ) {
      const k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
      str.push((v !== null && typeof v === 'object') ? serialize(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }
  return str.join('&');
}

export function sleep (ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validForm (form: FormGroup) {
  Object.values(form.controls).forEach(control => {
    control.markAsDirty();
  });
}

export const IMOBILIARIA = (host = 'apresentacao.plenoimob.com.br') => {
  return (
    window.location.host.includes('localhost') || window.location.host.includes('192.168.0.')
  ) ? host : window.location.host;
};

export enum Sistemas {
  locacao = 1,
  financeiro,
  vistoria,
  assinatura,
  integracaoisis,
  portalCliente,
  vendas
}

export function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateEmail (email: string) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function array_unique<T> (obj: Array<T>) {
  return Array.from(new Set(obj.map((aux) => JSON.stringify(aux)))).map((aux) => JSON.parse(aux)) as Array<T>;
}

export function corsAnywhere (link: string) {
  const cors = !window.location.host.includes('plenoimob') ? 'https://cors-anywhere.herokuapp.com/' : '';
  return `${cors}${link}`;
}

export function getImageFromUrl (url: any, name: string) {
  return new Promise(async (resolve) => {
    try {
      const data = await fetch(url).catch();
      const blob = await data?.blob();
      const reader = new FileReader();

      reader.addEventListener('loadend', function () {
        resolve({
          base64: reader.result,
          file: blob,
          name
        });
      }, false);
      reader.readAsDataURL(blob);
    } catch ( e ) {
      resolve({
        base64: null,
        file: null,
        name
      });
    }
  });
}

export function base64toFile (base64: any, filename: any) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while ( n-- ) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([ u8arr ], filename, { type: mime });
}

export function getImageFromPath (url: any) {
  return new Promise(async (resolve) => {
    try {
      const source = new Image();
      source.onload = () => {
        resolve(source);
      };
      source.src = url;
    } catch ( e ) {
      resolve(false);
    }
  });
}

export function fileToBase64 (file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function watermarkImage (base64: string, thumb = false, texto: string) {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if ( ctx ) {
        ctx.drawImage(img, 0, 0);

        if ( !thumb ) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(20, 20, 250, 50);
          ctx.fillStyle = '#000000';
          ctx.font = '20px Arial';
          ctx.fillText(texto, 40, 55);
        } else {
          ctx.fillStyle = '#fff';
          ctx.fillRect(10, 10, 160, 25);
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.fillText(texto, 25, 27);
        }
        resolve(canvas.toDataURL(base64MimeType(base64), 100));
      }
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = base64;
  });
}

export function base64MimeType (encoded: any): any {
  let result = null;

  if ( typeof encoded !== 'string' ) {
    return result;
  }

  const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if ( mime && mime.length ) {
    result = mime[1];
  }

  return result;
}

export function urlToFile (url: any, filename: any, mimeType: any) {
  return (fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([ buf ], filename, { type: mimeType });
      })
  );
}

export function formatCurrency (value: string | number) {
  value = String(value).replace('R$', '').trim();
  if ( String(value).includes('.') && String(value).includes(',') ) {
    const poxPoint = String(value).indexOf('.');
    const poxComma = String(value).indexOf(',');

    if ( poxPoint < poxComma ) {
      value = String(value).replace('.', '');
      value = String(value).replace(',', '.');
      value = parseFloat(value);
    } else {
      value = String(value).replace(',', '');
      value = parseFloat(value);
    }
  } else if ( String(value).includes('.') ) {
    value = parseFloat(String(value));
  } else if ( String(value).includes(',') ) {
    value = String(value).replace(',', '.');
    value = parseFloat(value);
  }
  return value as any;
}

export function allSettled (promises: Promise<any>[]) {
  return Promise.all(promises.map(p => p.then(
    value => value,
    reason => reason
  )));
}

/**
 * Check if a given string is a valid JSON or not.
 * @param {string} jsonString - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid JSON, otherwise false.
 */
export function isValidJSON (jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch ( error ) {
    return false;
  }
}

export function formatNum (valor: any, precisao?: number, to?: string, prefixo?: string, sufixo?: string) {
  precisao = precisao || precisao === 0 ? precisao : 2;

  if ( valor === null || typeof valor === 'undefined' ) {
    return null;
  }

  to = to || 'sys';

  if ( to === 'pt_BR' ) {
    valor = String(valor);
    valor = valor.replace('.', '');
    valor = valor.replace(',', '.');

    const formated = format({
      prefix: '',
      suffix: '',
      integerSeparator: '.',
      decimal: ',',
      padRight: 2,
      round: 2
    })(valor);

    return `${prefixo ? prefixo : ''}${formated}${sufixo ? sufixo : ''}`;
  } else if ( to === 'sys' ) {
    if ( valor.constructor !== String ) {
      valor = valor.toString();
    }

    if ( valor.replace(/[^\d]*/gi, '').length === 0 )
      return null;

    valor = parseFloat(
      valor
        .replace(/[^\d\.,]/g, '')
        .replace('.', '')
        .replace(',', '.')
    );
    return Math.round(valor * 1.0 * Math.pow(10, precisao)) / Math.pow(10, precisao);
  } else if ( to === 'round' ) {
    return (
      Math.round(parseFloat(String(valor * 1.0)) * Math.pow(10, precisao)) / Math.pow(10, precisao)
    );
  }

  return valor;
}
