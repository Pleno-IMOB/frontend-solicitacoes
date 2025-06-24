export interface Bairro {
  bai_codigo: number;
  bai_nome: string;
  bai_apelido: string | null;
  cid_codigo: number;
  bai_uf: number | null;
  bai_status: string;
}

export interface Uf {
  uf_codigo: number;
  uf_nome: string;
  uf_uf: string;
  uf_codigo_ibge: string | number;
}

export interface Cidade {
  cid_codigo: number;
  cid_nome: string;
  cid_cep: string | null;
  cid_ddd: string | null;
  uf_codigo: number;
  cid_codigo_ibge: string | number | null;
  uf?: Uf;
}

export interface CidadeOperacao {
  cid_ope_codigo: number;
  cid_ope_descricao: string | null;
  cid_codigo: number;
  uf_codigo: number;
  cid_ope_cor_card: string | null;
  cid_ope_cor_letra: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cid_ope_inicio_ferias: string | null;
  cid_ope_fim_ferias: string | null;
  cid_ope_mensagem_ferias: string | null;
  localizacao: string;
  descricao_completa: string;
  cidade: Cidade;
  uf: Uf;
}

export interface Pessoa {
  pes_codigo: number;
  pro_codigo: number | null;
  pes_nome: string;
  pes_tipo: string;
  pes_cpf: string;
  pes_cnpj: string;
  pes_rg: string | null;
  pes_nome_fantasia: string;
  pes_razao_social: string;
  pes_contato_responsavel: string | null;
  pes_data_nascimento: string | null;
  pes_data_cadastro: string;
  pes_estado_civil: string | null;
  pes_naturalidade: string | null;
  pes_cep: string;
  pes_endereco: string;
  pes_numero: string;
  pes_cep_cor: string | null;
  pes_endereco_cor: string | null;
  pes_numero_cor: string | null;
  bai_codigo: number;
  bai_codigo_cor: number | null;
  uf_codigo: number;
  uf_codigo_cor: number | null;
  cid_codigo: number;
  cid_codigo_cor: number | null;
  pes_ativa: boolean;
  pes_usar_endereco_cor: boolean;
  nac_codigo: number;
  pes_passaporte: string | null;
  pes_codigo_conjuge: number | null;
  pes_email: string;
  pes_telefone: string;
  pes_complemento: string;
  pes_complemento_cor: string | null;
  pes_codigo_importacao: number | null;
  usu_codigo: number;
  pes_codigo_aux: number | null;
  pes_codigo_responsavel: number;
  session_id: string | null;
  pes_sexo: string | null;
  pes_codigo_externo: number | null;
  pes_conjuge: string;
  int_codigo: number | null;
  pes_cnh: string | null;
  pes_orgao_expedidor: string | null;
  pes_area_cliente: string;
  pes_area_cliente_locatario: string;
  pes_area_cliente_locador: string;
  pes_area_cliente_dimob: string;
  pes_data_desativacao: string | null;
  pes_nome_pai: string | null;
  pes_nome_mae: string | null;
  forma_pagamento: number;
  pes_con_codigo: number | null;
  pes_ie: string | null;
  pes_orgao_expedidor_expedicao: string | null;
  pes_id_google: string | null;
  pes_id_facebook: string | null;
  pes_url_img_social: string | null;
  pes_responsaveis: number[];
  deleted_at: string | null;
  updated_at: string | null;
  created_at: string;
  pes_codigo_pai: number | null;
  pes_codigo_mae: number | null;
  pes_detalhes: string | null;
  pes_telefone_ddi: string;
  pes_codigo_interno: number | null;
  pes_assinatura: string | null;
  cli_codigo: number | null;
  pes_endereco_completo_formatado: string;
  pes_endereco_geolocalizacao: any[];
  pes_data_nascimento_formatada: string;
  pes_endereco_formatado: string;
  pes_cpf_formatado: string;
  pes_primeiro_nome: string;
  pes_sobrenome: string;
  pes_telefone_formatado: string;
  cpf_ou_cnpj: string;
  pes_cnpj_formatado: string;
  bairro: Bairro;
  cidade: Cidade;
  uf: Uf;
}

export interface ApiData<T> {
  code?: number;
  error: ErrorBackend;
  validation?: any[];
  success?: boolean;
  data: T;
}

export interface ErrorBackend {
  code?: number;
  message?: string;
  validation?: any;
  actions: [
    {
      class: string;
      link: string;
      title: string;
    }
  ];
}

export interface Foto {
  file?: any;
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
  fot_data?: string;
  path: string;
  path_thumb: string;
  status: number;
  selected?: boolean;
  loaded?: boolean;
  src?: string | void;
}

export interface Imobiliaria {
  imob_codigo: number;
  bai_codigo: number;
  imob_empresa: string;
  imob_creci: string;
  imob_cod_cid_dimob: number | null;
  imob_cpf: string | null;
  imob_inscricao_estadual: string | null;
  imob_inscricao_municipal: string;
  imob_site: string;
  imob_email: string;
  imob_telefone: string;
  imob_cep: string;
  imob_endereco: string;
  imob_numero: string;
  imob_logomarca: string;
  uf_codigo: number;
  cid_codigo: number;
  imob_tipo: string;
  imob_cnpj: string;
  imob_logomarca_enc: string;
  imob_cpf_rfb: string;
  imob_sms: number;
  imob_serierps: string;
  imob_aliq_atividade: string;
  imob_aliq_pis: string;
  imob_aliq_cofins: string;
  imob_aliq_inss: string;
  imob_aliq_iss: string;
  imob_aliq_ir: string;
  imob_aliq_csll: string;
  imob_razao_social: string;
  lis_codigo: string;
  imob_simples_nacional: string;
  imob_cnae: string;
  imob_numerorps: number;
  imob_naturezaoperacao: string;
  imob_chave_migra: string;
  imob_autorizado_nfse: number;
  imob_codigo_migra: number | null;
  imob_celular_token: string;
  imob_celular_token_acesso: string | null;
  imob_custo_ted_pulsar: string;
  imob_codigo_prefeitura: number | null;
  imob_nome_campo_tributavel: string;
  imob_numero_aedf: string | null;
  imob_android: string | null;
  imob_ios: string | null;
  imob_telefone_wpp: string;
  imob_imposto_venda: string;
  imob_nota_fiscal_email_contador: string;
  imob_nota_fiscal_certificado: string;
  imob_nota_fiscal_certificado_senha: string;
  imob_nota_fiscal_usuario: string | null;
  imob_nota_fiscal_senha: string | null;
  usu_codigo: number | null;
  imob_integracao_financeiro_em_andamento: number;
  pes_codigo: number;
  imob_integracao_boleto_em_andamento: number;
  imob_autorizado_nfse_data: string;
  serie_rps: string;
  numero_lote_rps: number;
  cnae: string;
  item_servico: string;
  regime_tributacao: number;
  nfse_login: string | null;
  nfse_password: string | null;
  certificado_senha: string;
  codigo_tributacao_municipio: number | null;
  exigibilidade_iss: number;
  iss_retido: number;
  responsavel_retencao: string | null;
  classe_imposto: string | null;
  iss: string;
  webmaniabr_id: number;
  webmaniabr_consumer_key: string;
  webmaniabr_consumer_secret: string;
  webmaniabr_access_token: string;
  webmaniabr_access_token_secret: string;
  webmaniabr_bearer_access_token: string;
  tipo_tributacao: string;
  regime_apuracao_sn: number;
  regime_especial_tributacao: number;
  natureza_operacao: number;
  numero_rps: number;
  descricao_nota: string | null;
  email_locador: boolean;
  imob_suporte_botao_mostrar: boolean;
  imob_suporte_botao_texto: string;
  imob_suporte_botao_contato: string;
  imob_endereco_completo_formatado: string | null;
  imob_endereco_geolocalizacao: any[];
  ignorar_pague_digital: boolean;
  imob_telefone_formatado: string;
  imob_telefone_wpp_formatado: string;
  pessoa: Pessoa;
  estado: Uf;
  cidade: Cidade;
  bairro: Bairro;
}

export interface TipoVistoria {
  tip_vis_codigo: number;
  tip_vis_descricao: string;
  tip_vis_cor: string | null;
  tip_vis_icon: string | null;
  tip_vis_titulo: string | null;
  tip_vis_obs: string | null;
}

export interface Usuario {
  search?: string;
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
  timestamp: string;
  pessoa: Pessoa;
  imobiliaria: string;
}

export interface Pergunta {
  index: number;
  message: string;
  time: string;
  loading?: boolean;
}

export interface Resposta {
  index?: number;
  time?: string;
  message?: string;
  blob?: Blob;
  base64?: string;
  isAudio?: boolean;
  url?: string;
}

export interface PerguntaResposta {
  index: number;
  iaMessage: Pergunta;
  userMessage: Resposta;
}
