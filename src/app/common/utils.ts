import { Imobiliaria } from './types';

export function formataEnderecoImobiliaria (imobiliaria: Imobiliaria): string {
  const { imob_endereco, imob_cep, bairro, cidade, estado } = imobiliaria;

  const partes: any[] = [];

  if ( imob_endereco ) {
    let linha = imob_endereco;
    if ( bairro?.bai_nome ) linha += `, ${bairro.bai_nome}`;
    partes.push(linha);
  } else if ( bairro?.bai_nome ) {
    partes.push(bairro.bai_nome);
  }

  if ( cidade?.cid_nome || estado?.uf_uf ) {
    const cidadeEstado: string = [
      cidade?.cid_nome || '',
      estado?.uf_uf || ''
    ].filter(Boolean).join('/');
    partes.push(cidadeEstado);
  }

  if ( imob_cep ) {
    partes.push(`CEP ${imob_cep}`);
  }

  return partes.join(' - ');
}