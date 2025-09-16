import { FormGroup } from '@angular/forms';
import format from 'format-number';
import { DataConfigInterface } from './types';

/**
 * Remove acentos e caracteres especiais de uma string.
 * @param {any} text - Texto que será processado para remoção de acentos e caracteres especiais.
 * @returns {string} - Retorna o texto sem acentos e caracteres especiais.
 */
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

/**
 * Limpa e formata os dados de um objeto com base nas configurações fornecidas.
 * @param {any} objeto - O objeto que será processado.
 * @param {DataConfigInterface} [cfg={}] - Configurações opcionais para formatação de dados.
 * @param {boolean} [removeEmptyArray=false] - Indica se arrays vazios devem ser removidos.
 */
export function limparDados (objeto: any, cfg: DataConfigInterface = {} as DataConfigInterface, removeEmptyArray = false) {
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

/**
 * Abre uma nova janela para imprimir o conteúdo HTML especificado.
 * @param {string | null} html - Conteúdo HTML a ser impresso. Se nulo, imprime o conteúdo do elemento com id 'printable'.
 * @param {boolean} landscape - Indica se a impressão deve ser em modo paisagem.
 */
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

/**
 * Encontra um objeto em um array com base em uma chave e valor fornecidos.
 * @param {any} array - O array onde a busca será realizada.
 * @param {any} key - A chave do objeto que será comparada.
 * @param {any} value - O valor que deve corresponder ao valor da chave.
 * @returns {any | null} - Retorna o objeto encontrado ou null se não encontrado.
 */
export function findObjectByKey (array: any, key: any, value: any) {
  for ( let i = 0; i < array.length; i++ ) {
    if ( array[i][key] === value )
      return array[i];
  }

  return null;
}

/**
 * Abre um PDF em uma nova aba do navegador.
 * @param {string} title - Título da nova aba.
 * @param {string} content - Conteúdo do PDF em base64.
 * @returns {boolean} - Retorna false se a aba foi aberta com sucesso, caso contrário true.
 */
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

/**
 * Serializa um objeto em uma string de consulta.
 * @param {any} obj - Objeto que será serializado.
 * @param {any} prefix - Prefixo opcional para as chaves do objeto.
 * @returns {any} - Retorna a string de consulta resultante.
 */
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

/**
 * Pausa a execução por um determinado número de milissegundos.
 * @param {any} ms - Número de milissegundos para pausar.
 * @returns {Promise<void>} - Promessa que resolve após o tempo especificado.
 */
export function sleep (ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Marca todos os controles de um formulário como sujos.
 * @param {FormGroup} form - O formulário cujos controles serão marcados.
 */
export function validForm (form: FormGroup) {
  Object.values(form.controls).forEach(control => {
    control.markAsDirty();
  });
}

/**
 * Retorna o host da imobiliária com base no ambiente atual.
 * @param {string} host - Host padrão a ser utilizado se estiver em localhost ou rede local.
 * @returns {string} - Host da imobiliária.
 */
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

/**
 * Pausa a execução por um determinado número de milissegundos.
 * @param {number} ms - Número de milissegundos para pausar.
 * @returns {Promise<void>} - Promessa que resolve após o tempo especificado.
 */
export function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Valida se uma string é um endereço de e-mail.
 * @param {string} email - Endereço de e-mail a ser validado.
 * @returns {boolean} - Retorna true se o e-mail for válido, caso contrário false.
 */
export function validateEmail (email: string) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Remove elementos duplicados de um array.
 * @param {Array<T>} obj - Array que será processado para remoção de duplicatas.
 * @returns {Array<T>} - Retorna um novo array sem elementos duplicados.
 */
export function array_unique<T> (obj: Array<T>) {
  return Array.from(new Set(obj.map((aux) => JSON.stringify(aux)))).map((aux) => JSON.parse(aux)) as Array<T>;
}

/**
 * Adiciona um proxy CORS ao link fornecido, se necessário.
 * @param {string} link - URL que será modificada para incluir o proxy CORS.
 * @returns {string} - Retorna a URL modificada com o proxy CORS, se aplicável.
 */
export function corsAnywhere (link: string) {
  const cors = !window.location.host.includes('plenoimob') ? 'https://cors-anywhere.herokuapp.com/' : '';
  return `${cors}${link}`;
}

/**
 * Obtém uma imagem de uma URL e a converte em base64.
 * @param {any} url - URL da imagem a ser obtida.
 * @param {string} name - Nome do arquivo da imagem.
 * @returns {Promise<{base64: any, file: Blob | null, name: string}>} - Promessa que resolve com a imagem em base64, o arquivo Blob e o nome.
 */
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

/**
 * Converte uma string base64 em um arquivo.
 * @param {any} base64 - String codificada em base64 que representa o conteúdo do arquivo.
 * @param {any} filename - Nome do arquivo a ser criado.
 * @returns {File} - Retorna um objeto File criado a partir da string base64.
 */
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

/**
 * Obtém uma imagem de uma URL e a retorna como um objeto Image.
 * @param {any} url - URL da imagem a ser carregada.
 * @returns {Promise<Image | boolean>} - Promessa que resolve com o objeto Image ou false em caso de erro.
 */
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

/**
 * Converte um Blob em uma string base64.
 * @param {any} blob - O Blob que será convertido.
 * @returns {Promise<string>} - Promessa que resolve com a string base64 resultante.
 */
export function fileToBase64 (blob: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

/**
 * Converte uma string base64 em um Blob.
 * @param {string} base64 - String codificada em base64 que representa o conteúdo do arquivo.
 * @param {string} mime - Tipo MIME do arquivo a ser criado.
 * @returns {Blob} - Retorna um objeto Blob criado a partir da string base64.
 */
export function base64ToBlob (base64: string, mime: string): Blob {
  const base64Clean = base64.split(',')[1] || base64;
  const byteCharacters = atob(base64Clean);
  const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([ byteArray ], { type: mime });
}

/**
 * Retorna o tipo MIME de uma string codificada em base64.
 * @param {any} encoded - String codificada em base64 que será analisada.
 * @returns {any} - Tipo MIME extraído da string ou null se não encontrado.
 */
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

/**
 * Converte uma URL em um objeto File.
 * @param {any} url - URL do recurso a ser convertido.
 * @param {any} filename - Nome do arquivo resultante.
 * @param {any} mimeType - Tipo MIME do arquivo.
 * @returns {Promise<File>} - Promessa que resolve com o objeto File criado.
 */
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
 * Formata um número de acordo com as especificações fornecidas.
 * @param {any} valor - Valor numérico a ser formatado.
 * @param {number} [precisao=2] - Número de casas decimais para arredondamento.
 * @param {string} [to='sys'] - Formato de saída desejado ('pt_BR', 'sys', 'round').
 * @param {string} [prefixo] - Prefixo opcional a ser adicionado ao valor formatado.
 * @param {string} [sufixo] - Sufixo opcional a ser adicionado ao valor formatado.
 * @returns {any} - Retorna o valor formatado ou null se o valor for inválido.
 */
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