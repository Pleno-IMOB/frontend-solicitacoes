import { FormGroup } from '@angular/forms';
import { inject } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

import format from 'format-number';

export const statusProposta = {
  1: { text: 'Novo Lead', class: 'bg-yellow', icon: 'fa-concierge-bell' },
  2: { text: 'Em Andamento', class: 'bg-yellow' },
  3: { text: 'Confecção do contrato', class: 'bg-info' },
  4: { text: 'Assinatura', class: 'bg-success' },
  5: { text: 'Encerrado', class: 'bg-primary' }
};

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

export interface DataConfig {
  toUpper?: boolean;
  toUpperIgnored?: string[];
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
      // win.onload = printFunction;
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

// ############################################################################################################################################################################################################
// ############################################################################################################################################################################################################
// NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR     // NÃO ALTERAR
export const IMOBILIARIA = (host = 'apresentacao.plenoimob.com.br') => {
  return (
    window.location.host.includes('localhost') || window.location.host.includes('192.168.0.')
  ) ? host : window.location.host;
}; // NÃO ALTERAR
// NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR // NÃO ALTERAR
// #################################################################################################################################################################
// #################################################################################################################################################################

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

export function detectmob () {
  return !!(navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    || window.innerWidth <= 1200);
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

export function resizeImageCanvas (base64: string, width: any, height: any, insertVideoIcon = false) {
  return new Promise<string>((resolve) => {
    const sourceImage = new Image();
    sourceImage.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      let minVal;
      if ( (sourceImage.width === sourceImage.height) && canvas ) {
        canvas.getContext('2d')?.drawImage(sourceImage, 0, 0, width, height);
      } else {
        minVal = Math.min(sourceImage.width, sourceImage.height);
        if ( sourceImage.width > sourceImage.height ) {
          canvas.getContext('2d')?.drawImage(sourceImage, (sourceImage.width - minVal) / 2, 0, minVal, minVal, 0, 0, width, height);
        } else {
          canvas.getContext('2d')?.drawImage(sourceImage, 0, (sourceImage.height - minVal) / 2, minVal, minVal, 0, 0, width, height);
        }
      }
      if ( insertVideoIcon && canvas && canvas?.getContext('2d') ) {
        const image = (await getImageFromPath('assets/img/play.png') as any);
        // canvas.getContext('2d').globalAlpha = 0.8;
        canvas.getContext('2d')?.drawImage(image,
          canvas.width / 2 - 50,
          canvas.height / 2 - 50,
          100,
          100);
      }
      resolve(canvas.toDataURL(base64MimeType(base64), 100));
    };
    sourceImage.src = base64;
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

// export function replaceTablesPhotos () {
//   $('table.fotos').replaceWith(function () {
//     let html = '';
//     $('td', this).each(function () {
//       if ( $(this).html() )
//         html += '<div>' + $(this).html() + '</div>';
//     });
//     return '<div class="fotos">' + html + '</div>';
//   });
// }

export function clearSyncFusionLicense () {
  const phrasesToCheck = [
    'syncfusion',
    'claim your free',
    'trial version',
    'essential studio'
  ];

  // Create a MutationObserver instance
  const observer = new MutationObserver((mutationsList, observer) => {
    for ( const mutation of mutationsList ) {
      if ( mutation.type === 'childList' ) {
        const addedNodesArray = Array.from(mutation.addedNodes);
        for ( const addedNode of addedNodesArray ) {
          if ( addedNode.nodeType === Node.ELEMENT_NODE && (addedNode as Element).tagName === 'DIV' ) {
            const textContent = addedNode.textContent?.toLowerCase();
            if ( phrasesToCheck.some(phrase => textContent?.includes(phrase)) ) {
              (addedNode as Element).remove();
            }
          }
        }
      }
    }
  });

  // Configuration of the observer
  const config = { childList: true, subtree: true };

  // Start observing the document
  observer.observe(document, config);
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

/**
 * Abre uma nova aba no navegador e configura um listener
 * para receber dados e efetuar uma requisição POST.
 */
export function baixarMidiasOpenTab () {
  const tab = window.open();

  const content = `
    <h2 style="margin-bottom: 0;">Iniciando geração do ZIP... 🚀</h2>
    <p style="margin: 5px 0;" id="progress-message">Aguarde, estamos preparando tudo. Isso pode levar alguns minutos.</p>
    <script>
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'EXECUTE_FUNCTION') {
          const jsonData = event.data.payload;
          fetchLink(jsonData);
        }
      });

      async function fetchLink(data) {
        const progressMessage = document.getElementById('progress-message');
        try {
          progressMessage.innerHTML += '<p>Enviando requisição ao servidor...</p>';

          const response = await fetch('https://vistoriabaixarfotos-g54tp5thua-rj.a.run.app/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (!response.body) {
            progressMessage.innerHTML = '<p>Erro ao iniciar resposta.</p>';
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');

          while (true) {
            const { done, value } = await reader.read();
            if (done){
              break;
            }

            // Atualiza o conteúdo com quebra de linha
            progressMessage.innerHTML = decoder.decode(value, { stream: true });
          }
        } catch (error) {
          console.error('Erro ao realizar o POST:', error);
          progressMessage.innerHTML = '<p>Erro de comunicação com o servidor. Tente novamente.</p>';
        }
      }
    </script>
  `;

  tab?.document.write(content);
  return tab;
}

/**
 * Verifica se o navegador atual é suportado com base em uma lista de navegadores populares e padrões de webview.
 * @returns {boolean} Retorna true se o navegador for suportado, caso contrário false.
 */
export function isSupportedBrowser (): boolean {
  const platform = inject(Platform);
  const TOP_BROWSER_SET = new Set<string>([
    'Chrome', 'Safari', 'Edge', 'Firefox', 'Samsung Internet', 'Opera',
    'Vivaldi', 'Brave', 'DuckDuckGo', 'Yandex', 'UC Browser', 'QQBrowser',
    'Coc Coc'
  ]);

  const WEBVIEW_PATTERNS = [
    'wv', 'webview', 'fbav', 'fban', 'fbsv',
    'instagram', 'linkedin', 'twitter', 'pinterest'
  ];

  const getBrowserName = (agent: string) => {
    if ( /firefox/i.test(agent) ) return 'Firefox';
    if ( /edg/i.test(agent) ) return 'Edge';
    if ( /samsungbrowser/i.test(agent) ) return 'Samsung Internet';
    if ( /opera|opr/i.test(agent) ) return 'Opera';
    if ( /vivaldi/i.test(agent) ) return 'Vivaldi';
    if ( /brave/i.test(agent) ) return 'Brave';
    if ( /duckduckgo/i.test(agent) ) return 'DuckDuckGo';
    if ( /yabrowser/i.test(agent) ) return 'Yandex';
    if ( /ucbrowser/i.test(agent) ) return 'UC Browser';
    if ( /qqbrowser/i.test(agent) ) return 'QQBrowser';
    if ( /coc_coc_browser/i.test(agent) ) return 'Coc Coc';
    if ( /chrome|crios|crmo/i.test(agent) ) return 'Chrome';
    if ( /safari/i.test(agent) && !/chrome|crios|crmo/i.test(agent) ) return 'Safari';

    return '';
  };

  if ( typeof navigator === 'undefined' || !navigator.userAgent ) {
    return false;
  }

  const userAgent = navigator.userAgent;
  const browserName = getBrowserName(userAgent);
  if ( !TOP_BROWSER_SET.has(browserName) ) {
    return false;
  }

  const lowerCaseUserAgent = userAgent.toLowerCase();
  const isAWebView = WEBVIEW_PATTERNS.some(pattern => lowerCaseUserAgent.includes(pattern));
  if ( isAWebView ) {
    return false;
  }

  return (
    platform.EDGE ||
    platform.SAFARI ||
    platform.FIREFOX ||
    platform.BLINK
  );
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