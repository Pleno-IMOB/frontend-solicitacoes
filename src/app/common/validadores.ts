import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as CNPJ from '@fnando/cnpj';
import * as CPF from '@fnando/cpf';
import moment from 'moment';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { formatNum } from '../../lib/common';

export namespace Validadores {
  /**
   * Valida se o campo é obrigatório, verificando se o valor não está vazio.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const obrigatorio: ValidatorFn = (control: AbstractControl) => {
    const value = control.value && typeof control.value === 'string' ? control.value.trim() : null;
    return !value ? { obrigatorio: { value } } : null;
  };

  /**
   * Valida se o valor do campo é um CPF válido.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const cpf: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    return value && !CPF.isValid(value) ? { cpf: { value } } : null;
  };

  /**
   * Valida se o valor do campo é um CNPJ válido.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const cnpj: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    return value && !CNPJ.isValid(value) ? { cnpj: { value } } : null;
  };

  /**
   * Valida se o valor do campo é um CPF ou CNPJ válido.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const cpfCnpj: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    return value && (((value || '').replace(/[^\d]/g, '').length <= 11 ? !CPF.isValid(value) : !CNPJ.isValid(value)) ? { cpfCnpj: { value } } : null);
  };

  /**
   * Valida se o valor do campo é um telefone válido com 10 ou 11 dígitos.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const telefone: ValidatorFn = (control: AbstractControl) => {
    const value = (control.value || '').replace(/[\D]*/gi, '');
    if ( value.length && [ 10, 11 ].indexOf(value.length) === -1 ) {
      return { telefone: { value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é um telefone com DDI válido com 12 ou 13 dígitos.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const telefoneDDI: ValidatorFn = (control: AbstractControl) => {
    const value = (control.value || '').replace(/[\D]*/gi, '');
    if ( value.length && [ 12, 13 ].indexOf(value.length) === -1 ) {
      return { telefoneDDI: { value } }; // Fixed the error key to 'telefoneDDI'
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é um celular válido com 11 dígitos.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const celular: ValidatorFn = (control: AbstractControl) => {
    const value = (control.value || '').replace(/[\D]*/gi, '');

    if ( value.length && value.length !== 11 ) {
      return { telefone: { value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é um celular sem DDD válido com 9 dígitos.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const celularSemDDD: ValidatorFn = (control: AbstractControl) => {
    const value = (control.value || '').replace(/[\D]*/gi, '');
    if ( value.length && value.length !== 9 ) {
      return { telefone: { value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o número de telefone é válido, considerando DDI e comprimento.
   * @param required Indica se o campo é obrigatório.
   * @return Função validadora que retorna erro se inválido, ou null se válido.
   */
  export function telInput (required = false): ValidatorFn {
    return (control: AbstractControl) => {
      // tslint:disable-next-line:prefer-const
      let { ddi, numero } = control.value;

      if ( required && (!ddi?.length || !numero?.length) )
        return required ? { required: { numero } } : null;

      numero = (numero || '').replace(/[\D]*/gi, '');

      if ( ddi != 55 )
        return null;

      switch ( numero?.length ) {
        case 11:
        case 10:
          return null;
        case 0:
          return required ? { required: { numero } } : null;
        default:
          return { telefone: { numero } };
      }
    };
  }

  /**
   * Valida se o valor do campo é diferente de zero.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const valorDiferenteDeZero: ValidatorFn = (control: AbstractControl) => {
    const value = control.value;
    return formatNum(value) > 0 ? null : { valorDiferenteDeZero: { value } };
  };

  /**
   * Valida se o valor do campo é um CEP válido com 8 dígitos.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const cep: ValidatorFn = (control: AbstractControl) => {
    const value = (control.value || '').replace(/[\D]*/gi, '');
    if ( value?.length !== 8 && value?.length ) {
      return { cep: { value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o CPF está disponível usando uma função de backend.
   * @param fnBackend Função de backend para verificar disponibilidade.
   * @return Função validadora que retorna erro se CPF não disponível, ou null se disponível.
   */
  export const cpfDisponivel =
    (fnBackend: Function) => {
      return (control: AbstractControl) => {
        return of(null)
          .pipe(
            switchMap(() => (!control.value ? of(null) : fnBackend(control.value))),
            map((res: any) => {
              return !res || Array.isArray(res) ? null : { cpfDisponivel: control.value };
            })
          );
      };
    };

  /**
   * Valida se o valor do campo é uma data válida no formato DD/MM/YYYY.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const data: ValidatorFn = (control: AbstractControl) => {

    if ( !control?.value?.length )
      return null;

    if ( control?.value?.length !== 10 || !moment(control.value, 'DD/MM/YYYY').isValid() ) {
      return { data: { value: control.value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é um mês e ano válidos no formato MM/YYYY.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const mesAno: ValidatorFn = (control: AbstractControl) => {
    if ( !control?.value?.length )
      return null;

    if ( control?.value?.length !== 7 || !moment(control.value, 'MM/YYYY').isValid() ) {
      return { data: { value: control.value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é uma URL válida.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const url: ValidatorFn = (control: AbstractControl) => {

    if ( !control?.value?.length )
      return null;

    if ( String(control.value).match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) )
      return null;
    else
      return { url: { value: control.value } };
  };

  /**
   * Valida se o valor do campo é uma data e hora válidas no formato DD/MM/YYYY HH:mm:ss.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const dataHora: ValidatorFn = (control: AbstractControl) => {

    if ( !control?.value?.length )
      return null;

    if ( control?.value?.length !== 19 || !moment(control.value, 'DD/MM/YYYY HH:mm:ss').isValid() ) {
      return { dataHora: { value: control.value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se o valor do campo é um número inteiro.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const numeroInteiro: ValidatorFn = (control: AbstractControl) => {

    if ( !control?.value?.length )
      return null;

    if ( !Number.isInteger(Number(control.value)) ) {
      return { numeroInteiro: { value: control.value } };
    } else {
      return null;
    }
  };

  /**
   * Valida se um registro está disponível usando uma função de backend.
   * @param keyErro Chave de erro a ser usada se o registro não estiver disponível.
   * @param fnBackend Função de backend para verificar disponibilidade.
   * @return Função validadora que retorna erro se registro não disponível, ou null se disponível.
   */
  export const registroDisponivel =
    (keyErro: string, fnBackend: Function) => {
      return (control: AbstractControl) => {
        return of(null)
          .pipe(
            //filter((v) => v),
            switchMap(() => (!control.value ? of(null) : fnBackend(control.value))),
            map((res: any) => {
              return !res || (Array.isArray(res) && res.length === 0) ? null : { [keyErro]: control.value };
            })
          );
      };
    };

  /**
   * Valida se o valor do campo é um horário válido no formato HH:MM.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const horario: ValidatorFn = (control: AbstractControl) => {
    const value = control.value || '';

    if ( !value ) {
      return null;
    }

    const regex = /^(\d{2}):(\d{2})$/;
    const match = regex.exec(value);

    if ( !match ) {
      return { horario: { value } };
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if ( hours < 0 || hours > 23 || minutes < 0 || minutes > 59 ) {
      return { horario: { value } };
    }

    return null;
  };

  /**
   * Valida se o valor do campo é um horário composto válido nos formatos H:MM, HH:MM ou HHH:MM.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se inválido, ou null se válido.
   */
  export const horarioComposto: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';

    if ( !value ) {
      return null;
    }

    // Regular expression to match valid time formats H:MM, HH:MM, HHH:MM
    // - single digit hours: \d
    // - double digit hours: [0-9]\d
    // - triple digit hours without leading zero: [1-9]\d{2}
    const regex = /^(\d|[0-9]\d|[1-9]\d{2}):([0-5]\d)$/;
    const match = regex.exec(value);

    if ( !match ) {
      return { horarioComposto: { value } };
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if ( hours < 0 || hours > 999 || minutes < 0 || minutes > 59 ) {
      return { horarioComposto: { value } };
    }

    return null;
  };

  /**
   * Valida se o horário de fim é maior que o horário de início.
   * @param campoInicio Nome do campo de horário de início.
   * @param campoFim Nome do campo de horário de fim.
   * @return Função validadora que retorna erro se horário de fim não for maior, ou null se válido.
   */
  export function horarioMaiorQue (campoInicio: string, campoFim: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if ( !control.parent ) {
        return null;
      }

      const horaInicio = control.parent.get(campoInicio)?.value;
      const horaFim = control.value;

      if ( horaInicio && horaFim ) {
        const inicio = moment(horaInicio, 'HH:mm');
        const fim = moment(horaFim, 'HH:mm');

        if ( !inicio.isValid() || !fim.isValid() ) {
          return null;
        }

        return inicio.isSameOrAfter(fim) ? { horarioMaiorQue: { campoInicio, campoFim, horaInicio, horaFim } } : null;
      }
      return null;
    };
  }

  /**
   * Valida se um campo dependente é obrigatório quando outro campo não é nulo.
   * @param dependentField Nome do campo dependente.
   * @return Função validadora que retorna erro se campo dependente for obrigatório e não preenchido, ou null se válido.
   */
  export function requiredSeOutroCampoNForNull (dependentField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if ( !control.parent ) {
        return null;
      }

      const dependentControl = control.parent.get(dependentField);
      if ( dependentControl && dependentControl.value !== null && !control.value ) {
        return { required: true };
      }
      return null;
    };
  }

  /**
   * Valida campos de horário dinâmicos para garantir que se um campo de início ou fim estiver preenchido, o correspondente também deve estar.
   * @return Função validadora que retorna erros de validação ou null se todos os campos estiverem corretos.
   */
  export function horariosDinamicosValidator (): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const hor_ate_manha_inicio = group.get('hor_ate_manha_inicio');
      const hor_ate_manha_fim = group.get('hor_ate_manha_fim');
      const hor_ate_tarde_inicio = group.get('hor_ate_tarde_inicio');
      const hor_ate_tarde_fim = group.get('hor_ate_tarde_fim');

      let errors: ValidationErrors = {};

      if ( hor_ate_manha_inicio?.value && !hor_ate_manha_fim?.value ) {
        hor_ate_manha_fim?.setErrors({ hor_ate_manha_fim_required: true });
        errors = { ...errors, hor_ate_manha_fim_required: true };
      } else {
        hor_ate_manha_fim?.setErrors(null);
      }

      if ( hor_ate_manha_fim?.value && !hor_ate_manha_inicio?.value ) {
        hor_ate_manha_inicio?.setErrors({ hor_ate_manha_inicio_required: true });
        errors = { ...errors, hor_ate_manha_inicio_required: true };
      } else {
        hor_ate_manha_inicio?.setErrors(null);
      }

      if ( hor_ate_tarde_inicio?.value && !hor_ate_tarde_fim?.value ) {
        hor_ate_tarde_fim?.setErrors({ hor_ate_tarde_fim_required: true });
        errors = { ...errors, hor_ate_tarde_fim_required: true };
      } else {
        hor_ate_tarde_fim?.setErrors(null);
      }

      if ( hor_ate_tarde_fim?.value && !hor_ate_tarde_inicio?.value ) {
        hor_ate_tarde_inicio?.setErrors({ hor_ate_tarde_inicio_required: true });
        errors = { ...errors, hor_ate_tarde_inicio_required: true };
      } else {
        hor_ate_tarde_inicio?.setErrors(null);
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Valida se um array possui o comprimento mínimo especificado.
   * @param minLength Número mínimo de elementos que o array deve ter.
   * @return Função validadora que retorna erro se comprimento for menor que o mínimo, ou null se válido.
   */
  export function arrayMinLengthValidator (minLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if ( !Array.isArray(value) || value.length < minLength || !value?.[0] ) {
        return { selectMinLength: { requiredLength: minLength, actualLength: Array.isArray(value) ? value.length : 0 } };
      }
      return null;
    };
  }

  /**
   * Valida a data de validade do cartão de crédito.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se data de validade for inválida, ou null se válida.
   */
  export const validateCardDate: ValidatorFn = (control: AbstractControl) => {
    const dateStr = control.value.replace(/_/g, '');

    if ( dateStr.length <= 4 ) return null;

    const [ inputMonthStr, inputYearStr ] = dateStr.split('/');
    const inputMonth = parseInt(inputMonthStr, 10);
    const inputYear = parseInt(inputYearStr, 10);

    const currentDate = new Date();
    const currentYear = parseInt(currentDate.getFullYear().toString().slice(-2), 10);
    const currentMonth = currentDate.getMonth() + 1;

    if ( inputMonth > 12 ) {
      return { 'ccData': true };
    }
    if ( inputYear < currentYear ) {
      return { 'ccData': true };
    } else if ( inputYear === currentYear && currentMonth > inputMonth ) {
      return { 'ccData': true };
    }

    return null;
  };

  /**
   * Valida o número do cartão de crédito usando o algoritmo de Luhn.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se número do cartão for inválido, ou null se válido.
   */
  export const validateCardNumber: ValidatorFn = (control: AbstractControl) => {
    let cardNumber = control.value.replace(/\D/g, '');

    if ( cardNumber.length < 14 ) {
      return { ccInvalido: true };
    }

    let total = 0;
    let reverseNumbers: any[] = Array.from(cardNumber).reverse();
    for ( let i = 0; i < reverseNumbers.length; i++ ) {
      let num = parseInt(reverseNumbers[i], 10);
      if ( i % 2 !== 0 ) {
        num *= 2;
        if ( num > 9 ) {
          num -= 9;
        }
      }
      total += num;
    }
    return total % 10 === 0 ? null : { ccInvalido: true };
  };

  /**
   * Valida o código de segurança do cartão.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se código de segurança for inválido, ou null se válido.
   */
  export const validateCodigoSeguranca: ValidatorFn = (control: AbstractControl) => {
    return control.value.includes('_') ? { 'ccCvvInvalido': true } : null;
  };

  /**
   * Valida se o nome completo possui pelo menos duas palavras com duas ou mais letras.
   * @param control Controle do formulário a ser validado.
   * @return Objeto de erro se nome for inválido, ou null se válido.
   */
  export const nomeCompleto: ValidatorFn = (control: AbstractControl) => {
    const nome = control.value?.trim();

    if ( !nome || typeof nome !== 'string' ) {
      return null;
    }

    // Divide o nome por espaços, remove strings vazias, e filtra palavras curtas
    const partes = nome.split(' ').filter(p => p.length >= 2);

    // Regras mínimas: pelo menos 2 palavras com 2 ou mais letras
    const nomeEhValido = partes.length >= 2;

    return nomeEhValido ? null : { nomeInvalido: true };
  };
}