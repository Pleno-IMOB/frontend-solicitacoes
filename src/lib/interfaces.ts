import { SafeHtml } from '@angular/platform-browser';

export interface Endereco {
  bai_codigo: number;
  bai_nome: string;
  cid_codigo: number;
  cid_nome: string;
  complemento: string;
  logradouro: string;
  uf_codigo: number;
  uf_uf: string;
}

export interface Uf {
  uf_codigo: number;
  uf_nome: string;
  uf_uf: string;
  uf_codigo_ibge: string;
}

export interface Cidade {
  cid_codigo: number;
  cid_nome: string;
  cid_cep: string;
  cid_ddd: string;
  uf_codigo: number;
  cid_codigo_ibge: string;
}

export interface Bairro {
  bai_codigo: number;
  bai_nome: string;
  bai_apelido: string;
  cid_codigo: number;
  bai_uf: number;
  bai_status: string;
}

export interface Notificacao {
  not_codigo: number,
  not_data: string,
  not_descricao: string,
  not_titulo: string,
  not_link: string,
  not_sta_codigo: number,
  sis_codigo: number
}

export interface Pessoa {
  deleted_at: string;
  pes_telefone_formatado: string;
  cliente: Cliente;
  cli_codigo: number;
  is_favorecido: boolean;
  pes_telefone_ddi: string;
  responsaveis: Pessoa[];
  uf: Uf;
  cidade: Cidade;
  bairro: Bairro;
  pes_codigo: number;
  pro_codigo: number;
  pes_nome: string;
  pes_tipo: string;
  pes_cpf: string;
  pes_cnpj: string;
  pes_rg: string;
  pes_nome_fantasia: string;
  pes_razao_social: string;
  pes_contato_responsavel: string;
  pes_data_nascimento: string;
  pes_data_cadastro: string;
  pes_estado_civil: string;
  pes_endereco_formatado: string;
  pes_naturalidade: string;
  pes_cep: string;
  pes_endereco: string;
  pes_numero: string;
  pes_cep_cor: string;
  pes_endereco_cor: string;
  pes_numero_cor: string;
  bai_codigo: number;
  bai_codigo_cor: number;
  uf_codigo: number;
  uf_codigo_cor: number;
  cid_codigo: number;
  cid_codigo_cor: number;
  pes_ativa: string;
  pes_usar_endereco_cor: boolean;
  nac_codigo: string;
  pes_passaporte: string;
  pes_codigo_conjuge: string;
  pes_email: string;
  pes_telefone: string;
  pes_complemento: string;
  pes_complemento_cor: string;
  pes_senha: string;
  pes_senha_provisoria: string;
  pes_codigo_importacao: string;
  usu_codigo: string;
  pes_codigo_aux: string;
  pes_codigo_responsavel: string;
  session_id: string;
  pes_sexo: string;
  pes_codigo_externo: string;
  pes_conjuge: string;
  int_codigo: string;
  pes_cnh: string;
  pes_orgao_expedidor: string;
  pes_area_cliente: string;
  pes_area_cliente_locatario: string;
  pes_area_cliente_locador: string;
  pes_area_cliente_dimob: string;
  pes_data_desativacao: string;
  pes_nome_pai: string;
  pes_nome_mae: string;
  forma_pagamento: string;
  pes_con_codigo: string;
  pes_ie: string;
  pes_orgao_expedidor_expedicao: string;
  timestamp: string;
  pes_primeiro_acesso?: number;
  contatos: PessoaContato[];
  pes_responsaveis: number[];
  pes_codigo_mae: number;
  pes_codigo_pai: number;
  auth_token?: string;
  pes_logo: string;
  is_locatario: boolean;
  is_locador: boolean;
  pes_cadastro_completo: boolean;
  pes_primeiro_nome: string;
  fil_codigo: number;
  vistoria_cliente: VistoriaCliente;
}

export interface VistoriaCliente {
  cli_codigo: number;
  pes_codigo: number;
}

export interface PessoaContato {
  pes_con_codigo: string;
  pes_codigo: number;
  tip_con_codigo: number;
  pes_con_contato: string;
  pes_con_descricao: string;
}

export interface TipoContato {
  tip_con_codigo: number;
  tip_con_descricao: string;
}

export interface ErrorBackend {
  code?: number;
  message?: string;
  validation?: any;
}

export interface ApiData<T> {
  code?: number,
  error: ErrorBackend,
  validation?: any[],
  success?: boolean,
  data: T
}

interface UsuarioContaBancaria {
  usu_con_ban_codigo: number;
  con_ban_codigo: number;
  con_ban_acessa: boolean;
  usu_codigo: number;
}

export interface Usuario {
  cli_codigo: number;
  cliente: Cliente;
  labelSelect?: string;
  usu_comissao: number;
  usu_codigo: number;
  usu_nome: string;
  usu_creci: string;
  usu_email: string;
  usu_telefone: string;
  usu_usuario: string;
  usu_senha: string;
  gru_codigo: number;
  usu_token: string;
  usu_desativado: string;
  usu_foto?: string;
  auth_token?: any;
  pessoa: Pessoa;
  usu_ativo: boolean;
  usu_ativo_: string;
  ativo: SafeHtml;
  fil_codigo: number;
  usu_email_desocupacao: string;
  timestamp: string;
  grupo?: {
    gru_codigo: number;
    gru_nome: string;
  };
  filial?: {
    usuario: Usuario;
    fil_codigo: number;
    fil_empresa: string;
  };
  cantEdit?: boolean;
  cantDelete?: boolean;
  comissoes: CorretorComissao[];
  permissoes?: UsuarioPermissao[];
  usu_financeiro_gerar_contas_a_pagar: number;
  usu_financeiro_imposto_parcela: boolean;
  sistemas: Sistema[];
  grupoHtml: SafeHtml;
  usuario_conta_bancaria: UsuarioContaBancaria[];
  pes_codigo?: number;
}

export interface AuthServiceUsuario extends Usuario {
  usu_codigo: number;
  foto: string;
  cli_codigo: number;
  auth_token?: string;
  permissoes?: UsuarioPermissao[];
}

export class Imobiliaria {
  bai_codigo: any;
  cid_codigo: any;
  imob_aliq_atividade: any;
  imob_aliq_cofins: any;
  imob_aliq_csll: any;
  imob_aliq_inss: any;
  imob_aliq_ir: any;
  imob_aliq_iss: any;
  imob_aliq_pis: any;
  imob_autorizado_nfse: any;
  imob_celular_token: any;
  imob_celular_token_acesso: any;
  imob_cep: any;
  imob_chave_migra: any;
  imob_cnae: any;
  imob_cnpj: any;
  imob_cod_cid_dimob: any;
  imob_codigo: any;
  imob_codigo_migra: any;
  imob_codigo_prefeitura: any;
  imob_cpf: any;
  imob_cpf_rfb: any;
  imob_creci: any;
  imob_custo_ted_pulsar: any;
  imob_email: any;
  imob_empresa: any;
  imob_endereco: any;
  imob_inscricao_estadual: any;
  imob_inscricao_municipal: any;
  imob_logomarca: any;
  imob_logomarca_enc: any;
  imob_naturezaoperacao: any;
  imob_nome_campo_tributavel: any;
  imob_numero: any;
  imob_numerorps: any;
  imob_razao_social: any;
  imob_serierps: any;
  imob_simples_nacional: any;
  imob_site: any;
  imob_sms: any;
  imob_telefone: any;
  imob_tipo: any;
  lis_codigo: any;
  uf_codigo: any;
  endereco: any;
}

export interface Log {
  log_codigo: number;
  usu_codigo: number;
  log_data: string;
  log_ip: string;
  log_controller: string;
  log_rota: string;
  log_sql: string;
  log_table: string;
  log_primary_key: number;
  log_descricao?: string[];
  usuario?: Usuario;
  expandir?: boolean;
}

export interface Atualizacao {
  atu_codigo: number;
  atu_titulo: string;
  atu_email: string;
  atu_wpp: string;
  created_at: string;
  atu_disparar_todos: boolean;
  atu_disparar_base: string;
  atu_wpp_2: string;
  atu_disparar_usuarios: boolean;
  atu_disparar_apenas_vistorias: boolean;
  atu_tip_codigo: number;
  produtos: {
    prod_codigo: number;
    prod_nome: string;
    prod_descricao: string[];
    prod_tip_codigo: number;
    sistemas: {
      sis_codigo: number;
      sis_nome: string;
    }[];
  }[];
  tipo_atualizacao: {
    atu_tip_codigo: number;
    atu_tip_descricao: string;
    atu_tip_icon: string;
    atu_tip_cor: string;
  };
  nao_lida?: boolean;
}

export interface AdminSistema {
  sis_codigo: number;
  sis_nome: string;
  sis_logo: string;
  sis_ativo?: boolean;
  grupos: AdminGrupo[];
}

export interface AdminGrupo {
  gru_codigo: any;
  gru_nome: string;
  modulos?: AdminModulo[];
}

export interface AdminModulo {
  mod_codigo: number;
  mod_nome: string;
  mod_controlador: string;
  mod_chave_primaria: string;
  mod_tabela: string;
  mod_descricao: string;
  sis_codigo: number;
  permissao: AdminPermissao;
}

export interface AdminPermissao {
  per_codigo: number;
  per_listar: boolean;
  per_adicionar: boolean;
  per_alterar: boolean;
  per_excluir: boolean;
  gru_codigo: number;
  mod_codigo: number;
}

export interface UsuarioGrupo {
  permissoes: UsuarioPermissao[];
  usu_gru_codigo: number;
  usu_codigo: number;
  gru_codigo: number;
  sis_codigo: number;
}

export interface UsuarioSistemaGrupo {
  sis_codigo: number;
  sis_nome: string;
  sis_logo: string;
  sis_ativo?: boolean;
  grupo: UsuarioGrupo;
}

export interface Imovel {
  cli_codigo: number;
  desc: string;
  imo_geolocalizacao: any[];
  imo_mobiliado: number;
  imo_endereco_formatado: string;
  uf: Uf;
  bairro: Bairro;
  cidade: Cidade;
  imo_complemento: string;
  uf_uf: string;
  endereco: string;
  imo_codigo: number;
  tip_imo_codigo: number;
  bai_codigo: number;
  imo_cep: string;
  imo_endereco: string;
  imo_numero: string;
  imo_unidade: string;
  imo_aluguel: string;
  imo_pontualidade: string;
  imo_preco_condominio: string;
  imo_total_pontual: string;
  imo_metragem: number;
  imo_total: string;
  imo_situacao: string;
  imo_ponto_referencia: string;
  imo_detalhes: string;
  imo_local_chaves: string;
  imo_informacoes: string;
  uf_codigo: number;
  cid_codigo: number;
  imo_iptu: string;
  imo_valor_pontual: string;
  imo_num_chaves: number;
  imo_pontualidade_tipo: string;
  imo_pontualidade_fixo: string;
  imo_pontualidade_porcentagem: string;
  imo_data_cadastro: string;
  imo_iptu_vezes: string;
  imo_status: string;
  edi_codigo: string;
  cond_codigo: string;
  imo_numero_economia: string;
  imo_numero_conosco: string;
  imo_ativa: string;
  usu_codigo: number;
  imo_codigo_aux: string;
  fil_codigo: number;
  imo_codigo_externo: string;
  int_codigo: string;
  imo_mostrar_iptu_debito_credito: string;
  imo_gerar_dimob: string;
  imo_matricula: string;
  imo_global: string;
  imo_data_ultima_atualizacao: string;
  imo_timestamp: string;
  imo_nome_locador: string;
  imo_venda: string;
  imo_ativo: string;
  imo_data_desativacao: string;
  imo_nome: string;
  imo_id_externo: string;
  imo_imagem_url: string;
  imo_valor_venda: string;
  imo_comissao: string;
  cid_nome: string;
  bai_nome: string;
  uf_nome: string;
  edi_descricao: string;
  text?: string;
  tipo?: {
    tip_imo_codigo: number;
    tip_imo_descricao: string;
    tip_imo_ativo: string;
    tip_imo_migra: string;
    tip_imo_tipo: string;
    tip_codigo: number;
    tip_nome: string;
  };
  locadores?: Pessoa[];
  imo_url_externa: string;
  imo_endereco_completo_formatado: string;
  vistorias: Vistoria[];
  documentos: DocumentoAnexado[];
}

export interface TipoImovel {
  pessoas: any;
  tip_imo_codigo: number;
  tip_imo_descricao: string;
  tip_imo_ativo: string;
  tip_imo_migra: string;
  tip_imo_tipo: string;
}

export interface Edificio {
  edi_codigo: number;
  edi_descricao: string;
  edi_sindico: string;
  adi_codigo: number;
  edi_tel_sindico: string;
  edi_codigo_aux: string;
  edi_cel_sindico: string;
  edi_cep: string;
  uf_codigo: number;
  cid_codigo: number;
  bai_codigo: number;
  edi_endereco: string;
  edi_numero: string;
  fil_codigo: number;
  edi_ativo: string;
}

export interface Filial {
  pessoa: Pessoa;
  fil_codigo: number;
  fil_empresa: string;
  fil_creci: string;
  fil_cpf: string;
  fil_cnpj: string;
  fil_inscricao_estadual: string;
  fil_inscricao_municipal: string;
  fil_site: string;
  fil_email: string;
  fil_telefone: string;
  fil_endereco: string;
  fil_numero: string;
  bai_codigo: string;
  fil_cep: string;
  cid_codigo: number;
  uf_codigo: string;
  fil_tipo: string;
  con_ban_codigo: number;
  fil_razao_social: string;
  usu_codigo: number;
}

export interface Nacionalidade {
  nac_codigo: number;
  nac_descricao: string;
}

export interface Profissao {
  pro_codigo: number;
  pro_nome: string;
}

export interface ClienteBoleto {
  status: string;
  cli_bol_codigo: number;
  cli_bol_data_referencia: string;
  cli_bol_data_vencimento: string;
  cli_bol_data_pagamento: string;
  cli_codigo: number;
  cli_bol_valor: string;
  cli_bol_tipo: string;
  cli_bol_pago: string;
  cli_bol_link: string;
  cli_bol_referencia: string;
  cli_bol_nosso_numero: string;
  cli_bol_linha_digitavel: string;
}

export interface ProcessoHistorico {
  proc_hist_codigo: number,
  proc_codigo: number,
  proc_hist_data: string,
  proc_hist_status: number,
  proc_hist_observacao: string;
  pessoa?: Pessoa;
}

export interface ProcessoPessoa {
  proc_pes_codigo: number;
  proc_codigo: number;
  pes_codigo: number;
  proc_pes_obrigatorio: boolean;
  pessoa?: Pessoa;
  dados_complementares?: DadoComplementar[];
  tipos_dados_complementares?: TipoDadoComplementar[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  opened?: boolean;
  tip_fun_codigo: number;
  tipo_funcao?: TipoFuncao;
  completo?: boolean;
}

export interface Processo {
  proc_codigo: number;
  imo_codigo: number;
  pes_codigo: number;
  con_codigo: number;
  vis_codigo: number;
  proc_tipo: number;
  proc_valor_aluguel: string;
  proc_valor_condominio: string;
  proc_valor_proposta: string;
  proc_status: number;
  proc_proposta: string;
  imovel?: Imovel;
  lead?: Pessoa;
  pessoas?: ProcessoPessoa[];
  contrato?: Contrato;
  vistoria?: Vistoria;
  historicos?: ProcessoHistorico[];
  status?: string;
  tipo?: string;
  proc_visualizado: boolean;
}

export interface TipoDadoComplementar {
  tip_dad_com_codigo: number;
  tip_dad_com_descricao: string;
  tip_dad_com_default: boolean;
  tip_dad_com_tipo: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface DadoComplementar {
  dad_com_codigo: number;
  tip_dad_com_codigo: number;
  proc_hist_codigo: number;
  dad_com_data: string;
  proc_codigo: number;
  tipo_dado_complementar: TipoDadoComplementar;
  dad_com_status: number;
  documento_anexado: DocumentoAnexado;
}

export interface DocumentoAnexado {
  arq_codigo: number;
  arquivos: DocumentoAnexadoArquivo[];
  arquivo: DocumentoAnexadoArquivo;
  con_codigo: number;
  doc_ane_arq_codigo_arquivo: number;
  doc_ane_codigo: number;
  doc_ane_data: string;
  doc_ane_descricao: string;
  doc_ane_nome: string;
  doc_ane_texto: string;
  doc_codigo_integracao: number;
  fia_codigo: number;
  imo_codigo: number;
  laravel_through_key: number;
  pes_codigo: number;
  proc_codigo: number;
  tip_doc_codigo: number;
  vis_codigo: number;
  updated_at: string;
  created_at: string;
  deleted_at: string;
  assinantes: DocumentoAnexadoAssinante[];
  documento_assinatura: Documento;
  file: any;
  tipodocumento: any;
  doc_ane_arq_codigo: number;
  doc_ane_arq_arquivo_extensao: string;
  nome_arquivo: string;
  url_arquivo: string;
  proc_hist_codigo?: number;
}

export interface DocumentoAnexadoAssinante {
  doc_ane_ass_codigo: number;
  doc_ane_codigo: number;
  pes_codigo: number;
  tip_fun_codigo: number;
  tipo_funcao: TipoFuncao;
  pessoa: Pessoa;
  opened?: boolean;
}

export interface DocumentoAnexadoArquivo {
  doc_ane_arq_arquivo_extensao: string;
  doc_ane_arq_arquivo_tamanho: string;
  doc_ane_arq_codigo: number;
  doc_ane_arq_codigo_arquivo: string;
  doc_ane_arq_descricao: string;
  doc_ane_arq_ordem: number;
  doc_ane_codigo: number;
  path: string;
}

export interface TipoFuncao {
  tip_fun_codigo: number;
  tip_fun_descricao: string;
  tip_fun_ativo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ContaBancaria {
  id: any;
  con_ban_codigo: number;
  con_ban_financeiro_principal: boolean;
  con_ban_saldo_inicial: number;
  con_ban_saldo_inicial_data: any;
  con_ban_tip_codigo: number;
  con_ban_tip_descricao: string;
  nome_conta: any;
}

export interface CorretorComissao {
  cor_com_codigo: number;
  cor_com_de: number;
  cor_com_ate: number;
  cor_com_comissao: number;
  pes_codigo: number;
  cor_com_data_referencia: string;
  cor_com_imposto: boolean;
}

export interface Sistema {
  sis_link_documentacao: string;
  bloqueado: boolean;
  auth_token: string;
  sis_codigo: number;
  sis_nome: string;
  sis_logo: string;
  img?: string;
  nome?: string;
  grupo?: Grupo;
  grupos?: Grupo[];
}

export interface Grupo {
  gru_codigo: number;
  gru_nome: string;
  modulos: AdminModulo[];
}

export interface ConfiguracaoNotificacao {
  tem_codigo: number;
  template: Template;
  disparo: ConfiguracaoNotificacaoDisparo[];
  con_not_codigo: number;
  con_not_titulo: string;
  con_not_descricao: string;
  con_not_valor: string;
  con_not_mostra_valor: boolean;
  con_not_tipo: string;
}

export interface ConfiguracaoNotificacaoDisparo {
  con_not_dis_codigo: number;
  con_not_dis_tipo: string;
  con_not_dis_para: string;
  con_not_codigo: number;
  con_not_dis_dispara: boolean;
}

export interface ConfiguracoesLocacao {
  con_nota_fiscal_servico_codigo: number;
  con_nota_fiscal_servico_descricao: string;
  con_codigo: number;
  con_contrato_ind_codigo: number;
  con_contrato_periodo_contrato: number;
  con_contrato_periodo_reajuste: number;
  con_contrato_data_vencimento: number;
  con_contrato_mostrar_faturamento_tipo: boolean;
  con_contrato_faturamento_tipo: string;
  con_contrato_mostrar_aluguel_proporcional: boolean;
  con_contrato_aluguel_proporcional: boolean;
  con_contrato_mostrar_aluguel_antecipado: boolean;
  con_contrato_aluguel_antecipado: boolean;
  con_contrato_cobrar_multa: boolean;
  con_contrato_valor_multa: number;
  con_contrato_multa_dias: number;
  con_contrato_cobrar_juros_mes: boolean;
  con_contrato_valor_juros_mes: number;
  con_contrato_juros_mes_dias: number;
  con_contrato_tipo_irrf: string;
  con_contrato_dimob: boolean;
  con_contrato_gerar_boleto: boolean;
  con_contrato_taxa_boleto: boolean;
  con_contrato_periodo_cobrar_multa_contratual: number;
  con_contrato_tipo_cobranca_multa_contratual: string;
  con_contrato_meses_multa_contratual: number;
  con_contrato_valor_fixo_multa_contratual: number;
  con_contrato_formula_rescisao: string;
  con_contrato_formas_envio: number[];
  con_contrato_encargos: number[];
  con_area_cliente_doc_ane_codigo_manual_locatario: number;
  manual_locatario: DocumentoAnexado;
  banner_app_area_cliente: DocumentoAnexado;
  con_notificacao_email_usar_smtp: boolean;
  con_notificacao_email_smtp_servidor: string;
  con_notificacao_email_smtp_porta: string;
  con_notificacao_email_smtp_usuario: string;
  con_notificacao_email_smtp_senha: string;
  con_usuario_senha_letra_maiusculas: boolean;
  con_usuario_senha_letra_minusculas: boolean;
  con_usuario_senha_numeros: boolean;
  con_usuario_senha_caracteres_especial: boolean;
}

export interface Indice {
  ind_nome: number;
  ind_codigo: string;
}

export interface Aba {
  titulo: string;
  icone?: string;
  disabled?: boolean;
  semiDisabled?: boolean;
  tipo: string;
  selected?: boolean;
  click?: () => {};
}

export interface Template {
  tem_codigo: number;
  tem_nome: string;
  tem_texto_email: string;
  tem_texto_sms: string;
  tem_texto_wpp: string;
  tem_tip_codigo: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  tipo: TemplateTipo;
}

export interface TemplateTipo {
  tem_tip_codigo: number;
  tem_tip_nome: string;
  variaveis: TemplateVariavel[];
}

export interface TemplateVariavel {
  tem_var_codigo: number,
  tem_var_variavel: string,
  tem_var_descricao: string
}

export interface Contrato {
  con_codigo: number;
  imo_codigo: number;
  ind_codigo: number;
  pes_codigo: number;
  tip_fia_codigo: number;
  con_data_inicio: string;
  con_data_prev_final: string;
  con_valor: string;
  con_qntd_meses: number;
  con_reajuste_meses: number;
  con_desconto_pontualidade: string;
  con_juros_dia: string;
  con_repassar_juros_dia: string;
  con_condominio: number;
  con_repassar_condominio: string;
  con_iptu: string;
  con_repassar_iptu: string;
  con_aluguel_garantido: string;
  con_carencia_repasse: number;
  con_taxa_adm: number;
  con_multa_contratual: string;
  con_tipo_multa_contratual: number;
  con_multa_con_meses: number;
  con_multa_con_fixo: number;
  con_valor_multa_contratual: number;
  con_descricao_garantia: string;
  con_finalidade: string;
  con_clausula_adicional: string;
  con_obs_locador: string;
  con_obs_locatario: string;
  con_valor_desconto_pontualidade: number;
  con_porc_desconto_pontualidade: number;
  con_valor_desconto_pontualidade_dias: number;
  con_valor_juros_dia: number;
  con_total_juros_dia: number;
  con_valor_juros_dias_dia: number;
  con_multa: string;
  con_valor_multa: number;
  con_total_multa: number;
  con_valor_multa_dias: number;
  con_repassar_multa: string;
  con_valor_condominio: number;
  con_valor_iptu: number;
  con_numero_vezes_iptu: number;
  con_taxa_adm_total: number;
  con_tipo_seguro_caucao: string;
  con_garantia_de: string;
  con_garantia_ate: string;
  con_garantia_valor: number;
  con_garantia_descricao: string;
  con_garantia_identificador: string;
  con_garantia_banco: string;
  con_garantia_apolice: string;
  con_garantia_seguradora: string;
  con_garantia_observacao: string;
  con_status: string;
  con_data_prox_reajuste: string;
  con_data_final: string;
  con_data_inicio_cobranca: number;
  con_irrf: string;
  con_honorarios_lancamentos: string;
  con_honorarios_lancamentos_valor: number;
  con_contrato: string;
  arq_codigo: number;
  con_dia_vencimento: string;
  con_taxa_tipo: string;
  con_juros_mes: string;
  con_repassar_juros_mes: string;
  con_valor_juros_mes: number;
  con_total_juros_mes: number;
  con_valor_juros_dias_mes: number;
  con_titulo_cap_numero: string;
  con_titulo_cap_valor: number;
  con_desconto_periodo: string;
  con_valor_desconto_periodo: number;
  con_data_desconto_periodo_de: string;
  con_data_desconto_periodo: string;
  con_desconto_periodo_reajustado_de: string;
  con_desconto_periodo_reajustado: string;
  con_mes_desconto_pontualidade: string;
  con_valor_desconto_pontualidade_tipo_dia: string;
  con_valor_desconto_periodo_anterior: number;
  con_data_desconto_periodo_de_anterior: string;
  con_data_desconto_periodo_anterior: string;
  con_taxa_boleto: string;
  con_gerar_boleto: string;
  con_taxa_adm_primeira: number;
  con_taxa_adm_total_primeira: number;
  con_taxa_tipo_primeira: string;
  fil_codigo: number;
  con_faturamento_mensal: string;
  con_faturamento_periodo: string;
  con_cobra_aluguel_com_condominio: number;
  con_periodo_multa_contratual: number;
  con_aluguel_antecipado: string;
  con_data_vencimento_prevista: string;
  con_aluguel_proporcional: string;
  con_codigo_externo: number;
  int_codigo: number;
  con_irrf_liquido: string;
  con_tipo: string;
  con_venda_valor: number;
  con_venda_data: string;
  con_entrada_valor: number;
  con_entrada_parcela: number;
  con_entrada_data: string;
  con_entrada_fixo: string;
  con_parcela_valor: number;
  con_parcela_parcela: number;
  con_parcela_data: string;
  con_parcela_fixo: number;
  con_reforco_valor: number;
  con_reforco_parcela: number;
  con_reforco_data: string;
  con_reforco_fixo: string;
  con_reforco_periodicidade: number;
  con_contrato_administrado_terceiro: string;
  con_garantia_reponsavel_valor: string;
  con_obs_imobiliaria: string;
  con_juridico: string;
  con_obs_rescisao: string;
  con_gerar_dimob: string;
  con_codigo_interno: string;
  vis_codigo: number;
  modelo: DocumentoAnexado;
  imovel: Imovel;
  indice: Indice;
  locatario: Pessoa;
  tipo_fianca: TipoFianca;
  anexo_vistoria: DocumentoAnexado;
  vistoria: Vistoria;
  reajustes: Reajuste[];
  desocupacao: Desocupacao;
  documentos: DocumentoAnexado[];
  vistorias: Vistoria[];
}

export interface Desocupacao {
  des_codigo: number;
  con_codigo: number;
  des_data_atual: string;
  des_data_previstal: string;
  des_declaracaol: string;
}

export interface Reajuste {
  con_codigo: number;
  ind_codigo: number;
  ind_var_codigo: number;
  rea_acumulado: string;
  rea_codigo: number;
  rea_data_reajuste: string;
  rea_desconto_contrato: string;
  rea_status: string;
  rea_valor_antigo: string;
  rea_valor_reajustado: string;
  rea_valor_reajustado_formatado: string;
}

export interface TipoFianca {
  tip_fia_codigo: number;
  tip_fia_descricao: string;
  tip_fia_locacao_online: boolean;
}

export interface ContratoEncargoContratual {
  enc_con_codigo: number;
  con_codigo: number;
  con_enc_con_status: string;
}

export interface EncargoContratual {
  enc_con_codigo: number;
  enc_con_descricao: string;
}

export interface FormaEnvio {
  for_env_codigo: number;
  for_env_descricao: string;
  for_env_ativo: string;
}

export interface Envio {
  env_notificacao: any;
  cantOthers: number[];
  env_data_clicado: string;
  env_data_aberto: string;
  env_envio_erro: string;
  env_data_enviado: string;
  status: EnvioStatus;
  env_tipo_extenso: string;
  env_tipo_icone: string;
  env_codigo: number;
  env_data: string;
  env_data_recebimento: string;
  env_assunto: string;
  env_conteudo: string;
  env_destinatario: string;
  env_tipo: string;
  env_sta_codigo: number;
}

export interface EnvioStatus {
  env_sta_codigo: number;
  env_sta_nome: string;
  html: string;
}

export interface Status {
  data_atualizada: string;
  sta_codigo: number;
  sta_nome: string;
  sta_icon: string;
  sta_ordem: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface VistoriaVistoriador {
  vis_vis_enviado: string;
  vis_vis_codigo: number;
  vis_codigo: number;
  usu_codigo: number;
  usuario: Usuario;
}

export interface VistoriaImportacao {
  vis_imp_codigo: number;
  vis_codigo: number;
  vis_imp_path_laudo: string;
  vis_imp_path_zip_fotos: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Vistoria {
  campos_personalizados: any[];
  vis_opcao_data_fotos_laudo: 'SEM_DATA' | 'COM_FOT_DATA' | 'COM_VIS_DATA';
  pessoas: Pessoa[];
  importacao?: VistoriaImportacao;
  vistoriadores: VistoriaVistoriador[];
  link_contestacao: string;
  descricao: string;
  cantDelete: boolean;
  cantEdit: boolean;
  cantOthers: number[];
  status: Status;
  status_criacao: Status;
  vis_data_termino_envio: string;
  vis_identificacao: string;
  doc_codigo: number;
  vis_codigo: number;
  tip_vis_codigo: number;
  imo_codigo: number;
  imo_rowid: number;
  usu_codigo: number;
  vis_data: string;
  vis_observacoes: string;
  vis_ativo: string;
  imo_endereco: string;
  vis_introducao: string;
  vis_introducao_obs: string;
  doc_codigo_integracao: number;
  imovel: Imovel;
  intervenientes: Interveniente[];
  assinantes: Interveniente[];
  tipo_vistoria: TipoVistoria;
  btn_selecionar: string;
  documento_assinatura: Documento;
  agendamento: any;
  usuario: Usuario;
  auditoria: VistoriaAuditoria;
  vis_metragem: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface TipoVistoria {
  tip_vis_codigo: number;
  tip_vis_descricao: string;
  tip_vis_ativo: boolean;
  tem_codigo: number;
}

export interface Interveniente {
  foto: Foto;
  int_codigo: number;
  pes_codigo: number;
  pes_rowid: number;
  vis_codigo: number;
  vis_rowid: number;
  tip_fun_codigo: number;
  tip_fun_rowid: number;
  int_assina: number;
  int_ordem: number;
  int_ativo: number;
  tipo_funcao: TipoFuncao;
  pessoa: Pessoa;
  opened?: boolean;
}

export interface Documento {
  doc_codigo: number;
  doc_assunto: string;
  doc_data: string;
  doc_nome: string;
  usu_codigo: number;
  arquivo: DocumentoArquivo;
  url_arquivo: string;
  arquivos: DocumentoAnexado[];
}

export interface DocumentoArquivo {
  doc_codigo: number;
  doc_hist_arquivo_extensao: string;
  doc_hist_arquivo_tamanho: number;
  doc_hist_base64: string;
  doc_hist_checksum: string;
  doc_hist_codigo: number;
  doc_hist_data: string;
  doc_hist_tipo: number;
}

export interface Chamado {
  cha_codigo: number;
  cha_tip_codigo: number;
  usu_codigo_abertura: number;
  pes_codigo_abertura: number;
  cha_tipo_usuario_abertura: string;
  cha_data: string;
  cha_descricao: string;
  con_codigo: number;
  pes_codigo: number;
  imo_codigo: number;
  cha_cat_codigo: number;
  usu_codigo_responsavel: number;
  cha_codigo_arquivo: number;
  cha_mostra_area_locador: boolean;
  cha_mostra_area_locatario: boolean;
  solicitante: Pessoa;
  responsavel: Pessoa;
  anexos: DocumentoAnexado[];
  historicos: ChamadoHistorico[];
}

export interface ChamadoHistorico {
  anexos: DocumentoAnexado[];
  pessoa: Pessoa;
  cha_his_codigo: number;
  cha_his_data: string;
  cha_his_descricao: string;
  usu_codigo: number;
  pes_codigo: number;
  cha_his_tipo_usuario_historico: number;
  usu_codigo_responsavel: number;
  cha_sta_codigo: number;
  cha_codigo: number;
  cha_his_codigo_arquivo: number;
}

export interface Recebimento {
  contrato: Contrato;
  rec_codigo: number;
  con_codigo: number;
  for_pag_codigo: number;
  rec_bol_nosso_numero: number;
  rec_valor: number;
  rec_data_venc: string;
  rec_data_receb: string;
  rec_historico: string;
  rec_repassar_multa: string;
  rec_repassar_juro: string;
  rec_status: string;
  rec_avulso: string;
  rec_dia: number;
  rec_mes: number;
  rec_ano: number;
  rec_data_referencia: string;
  rec_juro_valor: number;
  rec_multa_valor: number;
  rec_juro: string;
  rec_multa: string;
  rec_valor_pago: number;
  rec_rescisao: string;
  rec_data_repasse: string;
  rec_lancamento_avulso: string;
  con_ban_codigo: number;
  rec_link_pulsarpay: string;
  rec_enviado_remessa: string;
  rec_reference: number;
  rec_data_venc_original: string;
  rec_pjbank_nossonumero: string;
  rec_pjbank_id: string;
  rec_pjbank_banco: string;
  rec_pjbank_token: string;
  rec_pjbank_link: string;
  rec_pjbank_linha: string;
  rec_linha_digitavel: string;
  rec_nosso_numero_externo: string;
  rec_enviado_remessa_data: string;
  rec_codigo_externo: number;
  con_rec_codigo: number;
  rec_integrado_financeiro: boolean;
  rec_data_geracao: string;
  con_pag_codigo: number;
  rec_data_receb_financeiro: string;
  rec_codigo_barras: number;
  aco_par_codigo: number;
  updated_at_contas_a_receber: string;
  updated_at_contas_a_pagar: string;
  updated_at: string;
  link_boleto: string;
}

export interface PagamentoAgrupado {
  pag_agr_codigo: number;
  pag_agr_data: string;
  pes_codigo: number;
  pes_con_codigo: number;
  for_pag_codigo: number;
  pag_agr_nome_conta: string;
  pag_agr_nome_documento: string;
  pag_agr_compensacao: string;
  pag_agr_agencia: string;
  pag_agr_agencia_dv: string;
  pag_agr_conta: string;
  pag_agr_conta_dv: string;
  pag_agr_valor: number;
  pag_agr_tarifa: number;
  pag_agr_envio: string;
  pag_agr_retorno: string;
  pag_agr_externa_id: number;
  pag_agr_transacao_id: number;
  pag_agr_conta_bancaria_id: number;
  pag_agr_link: string;
  pag_agr_mensagem: string;
  pag_agr_status: string;
  pag_agr_chave: string;
  pag_agr_lancar_financeiro: number;
  con_ban_codigo: number;
  con_pag_codigo: number;
  link_extrato: string;
  pag_agr_data_pagamento: string;
  pessoa: Pessoa;
  status: string;
}

export interface TipoServico {
  tip_ser_codigo: number;
  tip_ser_nome: string;
  tip_ser_icone: string;
  prestadores: Pessoa[];
}

export interface Assinante {
  ass_codigo: number;
  doc_codigo: number;
  pes_codigo: number;
  ass_funcao: string;
  ass_codigo_acesso: string;
  ass_cpf: string;
  ass_email: string;
  ass_telefone: string;
  ass_data: string;
  ass_selfie: boolean;
  assinaturas: Assinatura[];
  pessoa: Pessoa;
  ass_assinado: boolean;
  documento: Documento;
}

export interface Assinatura {
  ass_ass_codigo: number;
  ass_codigo: number;
  ass_ass_tipo: number;
  ass_ass_assinado: boolean;
  mod_ass_codigo: number;
  ass_ass_data: string;
  ass_ass_ip: string;
  ass_ass_device_id: string;
  ass_ass_geolocalizacao: string;
  ass_ass_token: string;
  modelo: ModeloAssinatura;
  ass_ass_device_info: string;
  pes_codigo?: number;
}

export interface ModeloAssinatura {
  mod_ass_codigo: number;
  pes_codigo: number;
  mod_ass_tipo: string;
  mod_ass_base64: string;
  mod_ass_data: string;
}

export interface Token {
  hostToken: string;
  tok_codigo: number,
  doc_ane_codigo: number,
  pes_codigo: number,
  usu_codigo: number,
  tok_token: string,
  tok_telefone: string,
  tok_data: Date,
  tok_email: string,
  tok_wpp: string,
  tok_ip: string,
  tok_localizacao: JSON
}

export interface UsuarioPermissao {
  modulo: string;
  mod_nome: string;
  usu_per_codigo: number,
  mod_codigo: number,
  usu_per_adicionar: boolean,
  usu_per_alterar: boolean,
  usu_per_excluir: boolean,
  usu_per_listar: boolean
}

export interface WppInfo {
  pushname: string;
  me: {
    server: string;
    user: string;
    _serialized: string;
  },
  wi: {
    server: string;
    user: string;
    _serialized: string;
  },
  'phone': {
    wa_version: string;
    mcc: string;
    mnc: string;
    os_version: string;
    device_manufacturer: string;
    device_model: string;
    os_build_number: string;
  },
  platform: string;
}

export interface WppContact {
  photo: string;
}

export interface WppRemote {
  server: string;
  user: string;
  _serialized: string;
}

export interface WppId {
  fromMe: boolean;
  remote: WppRemote,
  id: string;
  self: string;
  _serialized: string;
}

export interface WppMessage {
  id: WppId,
  ack: number;
  hasMedia: boolean;
  body: string;
  type: string;
  timestamp: string;
  from: string;
  to: string;
  isForwarded: boolean;
  isStarred: boolean;
  fromMe: boolean;
  hasQuotedMsg: boolean;
  contact: WppContact;
  info: WppInfo
}

export interface TipoImovelCategoria {
  despesasFormatado?: string;
  liquidoFormatado?: string;
  receitasFormatado?: string;
  detalhar?: boolean;
  tip_imo_cat_codigo: number;
  tip_imo_cat_descricao: string;
  tip_imo_cat_ordem: number;
  tipos_de_imoveis: TipoImovel[];
}

export interface Parceiro {
  par_codigo: number;
  par_nome: string;
  par_token_integracao: string;
}

export interface NotaFiscal {
  not_fis_codigo: number;
  not_fis_sta_codigo: number;
  not_fis_emissao: string;
  not_fis_valor: number;
  not_fis_numero: string;
  pes_codigo: number;
  not_fis_sta_erro: string;
  not_fis_codigo_externo: string;
  not_fis_url_pdf: string;
  not_fis_url_xml: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  itens: NotaFiscalItem[];
  pessoa: Pessoa;
  status: NotaFiscalStatus;
}

export interface NotaFiscalItem {
  not_fis_ite_codigo: number;
  not_fis_codigo: number;
  not_fis_ite_descricao: string;
  con_rec_codigo: number;
  con_pag_codigo: number;
  contaReceber: ContaAReceber;
  contaPagar: ContaApagar;
}

export interface NotaFiscalStatus {
  not_fis_sta_codigo: number;
  not_fis_sta_nome: string;
}

export interface ContaAReceber {
  estorno: any;
  bgColor: string;
  cantEdit: boolean;
  categoria: any;
  cen_cus_codigo: number;
  centro_de_custos: any;
  con_ban_codigo: number;
  con_rec_codigo: number;
  con_rec_data: any;
  con_rec_data_competencia: any;
  con_rec_data_recebimento: any;
  con_rec_desconto: number;
  con_rec_descricao: string;
  con_rec_juros_multa: number;
  con_rec_numero_documento: number;
  con_rec_observacao: string;
  con_rec_recebido: any;
  con_rec_recorrente: string;
  con_rec_repetir: string;
  con_rec_repetir_codigo: number;
  con_rec_repetir_numero_parcela: number;
  con_rec_repetir_numero_total_parcela: number;
  con_rec_valor: number;
  con_rec_valor_recebido: number;
  for_pag_codigo: number;
  cod_locacao: number;
  cod_lancamento: number;
  pes_codigo: number;
  pessoa: Pessoa;
  ser_codigo: number;
  update: boolean;
  deleting: boolean;
  selected: boolean;
  display: string;
  banco?: string;
  contabancaria: ContaBancaria;
  con_rec_comentario: string;
  con_rec_tributavel: boolean;
  anexos: any[];
  venda?: any;
  receber?: SafeHtml;
  descricao: string;
  cantDelete?: boolean;
  parcelas?: any[];
  logs?: Log[];
  data?: string;
  valor?: number;
  fil_codigo: number;
  est_codigo: number;
  cantOthers?: number[];
}

export interface ContaApagar {
  estorno: any;
  bgColor: string;
  est_codigo: number;
  cantOthers: number[];
  categoria: any;
  cen_cus_codigo: number;
  centro_de_custos: any;
  con_ban_codigo: number;
  con_pag_codigo: number;
  con_pag_data: any;
  con_pag_data_competencia: any;
  con_pag_data_pagamento: any;
  con_pag_desconto: number;
  con_pag_descricao: string;
  con_pag_juros_multa: number;
  con_pag_numero_documento: number;
  con_pag_observacao: string;
  con_pag_pago: string;
  con_pag_recorrente: string;
  con_pag_repetir: string;
  con_pag_repetir_codigo: number;
  con_pag_repetir_numero_parcela: number;
  con_pag_repetir_numero_total_parcela: number;
  con_pag_valor: number;
  con_pag_valor_pago: number;
  for_pag_codigo: number;
  con_pag_comentario: string;
  cod_locacao: number;
  cod_lancamento: number;
  pes_codigo: number;
  pessoa: Pessoa;
  ser_codigo: number;
  update: boolean;
  deleting: boolean;
  selected: boolean;
  display: string;
  banco?: string;
  contabancaria: ContaBancaria;
  con_pag_tributavel: boolean;
  anexos: any[];
  pagar?: SafeHtml;
  descricao: string;
  cantDelete?: boolean;
  logs?: Log[],
  data?: string;
  valor?: number;
  fil_codigo: number;
  venda: any
}

export interface Divergencia {
  respostas: DivergenciaItemHistorico[];
  tipo_funcao: TipoFuncao;
  pessoa: Pessoa;
  div_codigo: number;
  vis_codigo: number;
  pes_codigo: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  itens: DivergenciaItem[];
}

export interface DivergenciaItemHistorico {
  div_ite_his_codigo: number;
  div_ite_his_descricao: number;
  div_ite_codigo: number;
  pes_codigo: number;
  div_ite_his_mostrar_no_laudo: number;
  pessoa: Pessoa;
  fotos: Foto[];
  videos: Video[];
  created_at: string;
}

export interface DivergenciaItem {
  respostas: any[];
  video: Video;
  foto: Foto;
  fotos: Foto[];
  videos: Video[];
  ambiente?: any;
  ambiente_item?: any;
  medidor?: any;
  chave?: any;
  div_ite_codigo: number;
  div_ite_descricao: string;
  div_codigo: number;
  div_referencia: string;
  vis_codigo: number;
  cha_codigo: number;
  med_codigo: number;
  amb_codigo: number;
  amb_ite_codigo: number;
  inc_codigo: number;
  fot_codigo: number;
  vid_codigo: number;
  not_codigo: number;
  aud_codigo: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export class WebSocket {
  start: ((token: string, email: string) => {}) | undefined;
  connect: ((token: string, email: string) => {}) | undefined;
}

export interface Message {
  notificacao: Notificacao;
  toast?: boolean;
  toastSuccess?: boolean;
  notificacoesNaoLidas: number;
  deleteNotificacao: number;
}

export interface DadoLogin {
  host: string;
  imagem: string;
  imobiliaria: string;
  pessoa: Pessoa;
}

export interface Video {
  vis_con_codigo: number;
  vid_codigo: number;
  amb_rowid: number;
  amb_codigo: number;
  amb_ite_codigo: number;
  amb_ite_rowid: number;
  cha_codigo: number;
  cha_rowid: number;
  med_codigo: number;
  med_rowid: number;
  vid_nome: string;
  vid_extensao: string;
  vid_ordem: number;
  vid_descricao: string;
  path: string;
  path_thumb: string;
}

export interface Foto {
  cloudSlug: string;
  vis_con_codigo: number;
  loading: boolean;
  rowid?: number;
  search?: string;
  fot_codigo: number;
  amb_rowid: number;
  amb_codigo: number;
  amb_ite_codigo: number;
  amb_ite_rowid: number;
  cha_codigo: number;
  cha_rowid: number;
  med_codigo: number;
  med_rowid: number;
  fot_nome: string;
  fot_extensao: string;
  fot_ordem: number;
  fot_descricao: string;
  path: string;
  path_thumb: string;
  status: number;
  selected?: boolean;
  loaded?: boolean;
  src?: string | void;
}

export interface ResumoPlano {
  cli_pla_codigo: number;
  bloqueado: boolean;
  sis_codigo: number;
  sis_nome: string;
  cli_pla_valor: string;
  limitacao: string;
  cli_pla_valor_adicional: string;
}

export interface DetalhesDoPlano {
  cli_pla_codigo: number;
  sis_codigo: number;
  sis_nome: string;
  cli_pla_valor: string;
  cli_pla_valor_adicional: string;
  limitacao: string;
  reajustes: DetalheReajuste[];
}

export interface DetalheReajuste {
  cli_pla_rea_codigo: number;
  cli_pla_codigo: number;
  cli_pla_rea_percentual: string;
  cli_pla_rea_data: string;
  valor_pos_reajuste: string;
}

export interface OpcoesParaContratacao {

}

export interface Cliente {
  cli_codigo: number;
  pes_codigo: number;
  pessoa: Pessoa;
}

export interface VistoriaAuditoria {
  aud_codigo: number;
  aud_nota: number;
  usu_codigo: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  historico: VistoriaAuditoriaHistorico[];
}

export interface VistoriaAuditoriaHistorico {
  usuario: Usuario;
  aud_his_codigo: number;
  aud_codigo: number;
  usu_codigo: number;
  aud_his_descricao: string;
  aud_his_notificar_vistoriador: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Integrador {
  grupoHtml: any;
  usu_codigo: number;
  int_ativacao: boolean;
  int_client_id: string;
  int_codigo: number;
  int_descricao: string;
  int_nome: string;
  usuario: Usuario;
}
