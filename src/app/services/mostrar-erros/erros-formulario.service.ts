import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ErrosFormularioService {
  constructor (
    private toaster: ToastrService
  ) {
  }

  /**
   * Formata um objeto de erros em uma mensagem de string.
   * @param obj Objeto contendo os erros a serem formatados.
   * @param onlyFirst Indica se apenas o primeiro erro deve ser retornado.
   * @return Mensagem de erro formatada como string.
   */
  formatObjToMsg (obj: any, onlyFirst = true): string {
    const erros: any[] = Object.keys(obj).map(key => this.formatMsg(key, obj[key]));
    return onlyFirst ? erros.pop() : erros.join('<br>');
  }

  /**
   * Formata uma mensagem de erro com base na chave e valor fornecidos.
   * @param key Chave que identifica o tipo de erro.
   * @param value Valor associado ao erro, usado para personalizar a mensagem.
   * @return Mensagem de erro formatada como string.
   */
  public formatMsg (key: string, value: any) {
    switch ( key ) {
      case 'required':
        return 'Campo Obrigatório!';
      case 'obrigatorio':
        return 'Campo Obrigatório, espaços em branco não são considerados!';
      case 'minlength':
        return `Informe no mínimo ${value.requiredLength} caractéres!`;
      case 'maxlength':
        return `Informe no máximo ${value.requiredLength} caractéres!`;
      case 'min':
        return `Informe um número maior ou igual a ${value.min}!`;
      case 'max':
        return `Informe um número menor ou igual a ${value.max}!`;
      case 'pattern':
        return `Informe um valor válido para a seguinte expressão regular ${
          value.requiredPattern
        }!`;
      case 'email':
        return 'E-mail inválido!';
      case 'email_not_found':
        return 'E-mail não encontrado em nossa base!';
      case 'cpf':
        return 'CPF inválido!';
      case 'cpf_not_found':
        return 'CPF não encontrado em nossa base!';
      case 'cnpj':
        return 'CNPJ inválido!';
      case 'cpfCnpj':
        return 'CPF ou CNPJ inválido!';
      case 'telefone':
        return 'Telefone incompleto!';
      case 'valoresIguais':
        return `Valor deve ser igual ${value.label}!`;
      case 'valoresDiferentes':
        return `Valor deve ser diferente ${value.label}!`;
      case 'disponibilidade':
        return `${value.label} já utilizado!`;
      case 'valorDiferenteDeZero':
        return `Valor deve ser maior que R$ 0,00!!`;
      case 'cpfDisponivel':
        return `CPF já cadastrado!`;
      case 'pessoaIndisponivelCliente':
        return `Pessoa já vinculada a outro cliente!`;
      case 'cep':
        return `CEP inválido!`;
      case 'data':
        return `Data inválida!`;
      case 'dataHora':
        return 'Data/Hora inválida!';
      case 'url':
        return `Valor deve ser uma URL válida!!`;
      case 'senhaFraca':
        return `Insira uma senha segura exemplo: Axl23!`;
      case 'senhaNumero':
        return `Sua senha deve possuir pelo menos um digito numérico!`;
      case 'senhaMinusculo':
        return `Sua senha deve possuir pelo menos uma letra minúscula!`;
      case 'senhaMaiusculo':
        return `Sua senha deve possuir pelo menos uma letra maiúscula!`;
      case 'senhaEspecial':
        return `Sua senha deve possuir pelo menos um caractere especial!`;
      case 'senhaTamanho':
        return `Sua senha deve possuir minimo 6 à 30 caracteres!`;
      case 'isMatching':
        return `As senhas devem ser iguais!`;
      case 'horario':
        return `Horário inválido. Insira um horário entre 00:00 e 23:59.`;
      case 'horarioComposto':
        return `Horário inválido. Insira um horário entre 00:00 e 999:59.`;
      case 'hor_ate_manha_fim_required':
        return `O horário de fim da manhã é obrigatório quando o início está preenchido.`;
      case 'hor_ate_tarde_inicio_required':
        return `O horário de início da tarde é obrigatório quando o fim está preenchido.`;
      case 'hor_ate_manha_inicio_required':
        return `O horário de início da manhã é obrigatório quando o fim está preenchido.`;
      case 'hor_ate_tarde_fim_required':
        return `O horário de fim da tarde é obrigatório quando o início está preenchido.`;
      case 'selectMinLength':
        return `O campo deve ter pelo menos uma descrição selecionada.`;
      case 'ccInvalido':
        return 'Número de cartão inválido.';
      case 'ccData':
        return 'Data de validade inválida!';
      case 'ccCvvInvalido':
        return 'Data de validade inválida!';
      case 'nomeInvalido':
        return 'Nome completo incorreto!';
      default:
        return 'Valor inválido!';
    }
  }

  /**
   * Marca todos os controles do formulário como sujos e exibe uma mensagem de erro.
   * @param form Formulário a ser validado.
   * @return Não retorna valor.
   */
  validForm (form: FormGroup) {
    Object.values(form.controls).forEach(control => {
      control.markAsDirty();
    });
    this.toaster.error('Erro nas validação das informações. Verifique os dados informados.', 'Oppps!');
  }
}
