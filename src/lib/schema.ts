import { z } from 'zod';
import { ESTADOS_CIVIS, POSICAO_OUTRO, POSICOES_IGREJA, onlyDigits, type FichaData } from './ficha';

export const fichaSchema = z
  .object({
    nomeCompleto: z.string().trim().min(3, 'Informe o nome completo'),
    dataNascimento: z.string().min(1, 'Informe a data de nascimento'),
    rg: z.string().trim().min(1, 'Informe o RG'),
    cpf: z.string().refine(v => onlyDigits(v).length === 11, 'CPF deve ter 11 dígitos'),
    mae: z.string().trim().min(1, 'Informe o nome da mãe'),
    pai: z.string().trim().min(1, 'Informe o nome do pai'),
    celular: z.string().refine(v => onlyDigits(v).length >= 10, 'Celular deve ter DDD + número'),
    residencial: z.string(),
    estadoCivil: z.enum(ESTADOS_CIVIS, { message: 'Selecione o estado civil' }),
    conjuge: z.string().trim(),
    endereco: z.string().trim().min(1, 'Informe o endereço'),
    bairro: z.string().trim().min(1, 'Informe o bairro'),
    dataBatismo: z.string().min(1, 'Informe a data do batismo'),
    posicaoIgreja: z.enum(POSICOES_IGREJA, {
      message: 'Selecione a posição na igreja',
    }),
    posicaoIgrejaOutra: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    const casado = value.estadoCivil === 'Casado(a)' || value.estadoCivil === 'União estável';
    if (casado && value.conjuge.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['conjuge'],
        message: 'Informe o nome do cônjuge',
      });
    }
    if (value.posicaoIgreja === POSICAO_OUTRO && value.posicaoIgrejaOutra.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['posicaoIgrejaOutra'],
        message: 'Descreva a posição na igreja',
      });
    }
  });

export type FichaFormValues = z.infer<typeof fichaSchema>;

export const DEFAULT_FORM_VALUES: FichaFormValues = {
  nomeCompleto: '',
  dataNascimento: '',
  rg: '',
  cpf: '',
  mae: '',
  pai: '',
  celular: '',
  residencial: '',
  estadoCivil: '' as FichaFormValues['estadoCivil'],
  conjuge: '',
  endereco: '',
  bairro: '',
  dataBatismo: '',
  posicaoIgreja: '' as FichaFormValues['posicaoIgreja'],
  posicaoIgrejaOutra: '',
};

/** Converte os valores do formulário no modelo usado pelo PDF/preview. */
export function toFichaData(values: Partial<FichaFormValues>): FichaData {
  return {
    nomeCompleto: values.nomeCompleto ?? '',
    dataNascimento: values.dataNascimento ?? '',
    rg: values.rg ?? '',
    cpf: values.cpf ?? '',
    mae: values.mae ?? '',
    pai: values.pai ?? '',
    celular: values.celular ?? '',
    residencial: values.residencial ?? '',
    estadoCivil: values.estadoCivil ?? '',
    conjuge: values.conjuge ?? '',
    endereco: values.endereco ?? '',
    bairro: values.bairro ?? '',
    dataBatismo: values.dataBatismo ?? '',
    posicaoIgreja:
      values.posicaoIgreja === POSICAO_OUTRO ? (values.posicaoIgrejaOutra ?? '') : (values.posicaoIgreja ?? ''),
  };
}
