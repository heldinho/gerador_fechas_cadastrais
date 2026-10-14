import { Controller, type UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Eraser } from 'lucide-react';
import { ESTADOS_CIVIS, POSICAO_OUTRO, POSICOES_IGREJA, maskCpf, maskPhone } from '@/lib/ficha';
import type { FichaFormValues } from '@/lib/schema';

interface FichaFormProps {
  form: UseFormReturn<FichaFormValues, unknown, FichaFormValues>;
  onReset: () => void;
}

export function FichaForm({ form, onReset }: FichaFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = form;

  const estadoCivil = watch('estadoCivil');
  const posicao = watch('posicaoIgreja');
  const precisaConjuge = estadoCivil === 'Casado(a)' || estadoCivil === 'União estável';
  const posicaoEOutro = posicao === POSICAO_OUTRO;

  /** Input com máscara controlada pelo RHF. */
  const masked = (name: 'cpf' | 'celular' | 'residencial', apply: (v: string) => string) => {
    const value = watch(name) ?? '';
    return (
      <Input
        inputMode={name === 'cpf' ? 'numeric' : 'tel'}
        placeholder={name === 'cpf' ? '000.000.000-00' : '(00) 00000-0000'}
        value={value}
        aria-invalid={Boolean(errors[name])}
        onChange={e => setValue(name, apply(e.target.value), { shouldValidate: isSubmitted })}
      />
    );
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Dados do membro</CardTitle>
          <CardDescription>
            Preencha conforme o modelo impresso. Campos com <span className="text-destructive">*</span> são
            obrigatórios.
          </CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <Eraser className="size-4" /> Limpar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <Section title="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" error={errors.nomeCompleto?.message} className="sm:col-span-2">
              <Input
                placeholder="Nome como consta no documento"
                aria-invalid={Boolean(errors.nomeCompleto)}
                {...register('nomeCompleto')}
              />
            </Field>
            <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
              <Input type="date" aria-invalid={Boolean(errors.dataNascimento)} {...register('dataNascimento')} />
            </Field>
            <Field label="RG" error={errors.rg?.message}>
              <Input placeholder="000000000" aria-invalid={Boolean(errors.rg)} {...register('rg')} />
            </Field>
            <Field label="CPF" error={errors.cpf?.message}>
              {masked('cpf', maskCpf)}
            </Field>
          </div>
        </Section>

        <Separator />

        <Section title="Filiação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mãe" error={errors.mae?.message}>
              <Input placeholder="Nome da mãe" aria-invalid={Boolean(errors.mae)} {...register('mae')} />
            </Field>
            <Field label="Pai" error={errors.pai?.message}>
              <Input placeholder="Nome do pai" aria-invalid={Boolean(errors.pai)} {...register('pai')} />
            </Field>
          </div>
        </Section>

        <Separator />

        <Section title="Contato">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone celular" error={errors.celular?.message}>
              {masked('celular', maskPhone)}
            </Field>
            <Field label="Telefone residencial (opcional)" error={errors.residencial?.message}>
              {masked('residencial', maskPhone)}
            </Field>
          </div>
        </Section>

        <Separator />

        <Section title="Estado civil">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado civil" error={errors.estadoCivil?.message}>
              <Controller
                control={control}
                name="estadoCivil"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={Boolean(errors.estadoCivil)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_CIVIS.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            {precisaConjuge ? (
              <Field label="Nome do cônjuge" error={errors.conjuge?.message}>
                <Input placeholder="Nome do cônjuge" aria-invalid={Boolean(errors.conjuge)} {...register('conjuge')} />
              </Field>
            ) : null}
          </div>
        </Section>

        <Separator />

        <Section title="Endereço">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Endereço" error={errors.endereco?.message} className="sm:col-span-2">
              <Input
                placeholder="Rua, número, complemento"
                aria-invalid={Boolean(errors.endereco)}
                {...register('endereco')}
              />
            </Field>
            <Field label="Bairro" error={errors.bairro?.message}>
              <Input placeholder="Bairro" aria-invalid={Boolean(errors.bairro)} {...register('bairro')} />
            </Field>
          </div>
        </Section>

        <Separator />

        <Section title="Igreja">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data do batismo" error={errors.dataBatismo?.message}>
              <Input type="date" aria-invalid={Boolean(errors.dataBatismo)} {...register('dataBatismo')} />
            </Field>
            <Field label="Posição na igreja" error={errors.posicaoIgreja?.message}>
              <Controller
                control={control}
                name="posicaoIgreja"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={Boolean(errors.posicaoIgreja)}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {POSICOES_IGREJA.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            {posicaoEOutro ? (
              <Field label="Descreva a posição" error={errors.posicaoIgrejaOutra?.message}>
                <Input
                  placeholder="Ex.: Secretário(a)"
                  aria-invalid={Boolean(errors.posicaoIgrejaOutra)}
                  {...register('posicaoIgrejaOutra')}
                />
              </Field>
            ) : null}
          </div>
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
