import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toaster, toast } from 'sonner';
import { Download, FileText, Loader2, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FichaForm } from '@/components/FichaForm';
import { FichaPreview } from '@/components/FichaPreview';
import { SettingsCard } from '@/components/SettingsCard';

import {
  clearDraft,
  loadChurchConfig,
  loadDraft,
  loadSecretaryPhone,
  saveChurchConfig,
  saveDraft,
  saveSecretaryPhone,
  type ChurchConfig,
} from '@/lib/ficha';
import { DEFAULT_FORM_VALUES, fichaSchema, toFichaData, type FichaFormValues } from '@/lib/schema';

type Action = 'download' | 'whatsapp';

export default function App() {
  const [config, setConfig] = useState<ChurchConfig>(() => loadChurchConfig());
  const [secretaryPhone, setSecretaryPhone] = useState<string>(() => loadSecretaryPhone());
  const [busy, setBusy] = useState<Action | null>(null);

  const form = useForm<FichaFormValues, unknown, FichaFormValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      ...((loadDraft() as Partial<FichaFormValues> | null) ?? {}),
    },
  });

  const watched = form.watch();

  // Rascunho automático: nada se perde se a página fechar no meio do preenchimento.
  useEffect(() => {
    saveDraft(watched);
  }, [watched]);

  useEffect(() => {
    saveChurchConfig(config);
  }, [config]);

  useEffect(() => {
    saveSecretaryPhone(secretaryPhone);
  }, [secretaryPhone]);

  const runAction = (action: Action) => async (values: FichaFormValues) => {
    const data = toFichaData(values);
    setBusy(action);
    try {
      // pdf-lib (~400 kB) só é carregado quando o usuário gera/envia.
      const { buildFichaPdf, downloadPdf, pdfFileName } = await import('@/lib/pdf');

      if (action === 'download') {
        const bytes = await buildFichaPdf(data, config);
        downloadPdf(bytes, pdfFileName(data));
        toast.success('PDF A4 gerado com sucesso.', {
          description: 'O download começou agora.',
        });
        return;
      }

      if (!secretaryPhone) {
        toast.warning('Informe o WhatsApp do secretário.', {
          description: 'Preencha o número no bloco Configurações antes de enviar.',
        });
        return;
      }

      const { sendFichaViaWhatsApp } = await import('@/lib/whatsapp');
      const result = await sendFichaViaWhatsApp(data, secretaryPhone, config);
      if (result === 'shared') {
        toast.success('Ficha enviada para o WhatsApp.', {
          description: 'O PDF foi anexado à conversa.',
        });
      } else if (result === 'fallback') {
        toast.info('Conversa do WhatsApp aberta.', {
          description:
            'Este navegador não permite anexar arquivos automaticamente. Toque em “Baixar PDF A4” e anexe o arquivo na conversa.',
          duration: 10000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível gerar o PDF.', {
        description: 'Verifique os dados e tente novamente.',
      });
    } finally {
      setBusy(null);
    }
  };

  const submit = (action: Action) => () =>
    form.handleSubmit(runAction(action), () => toast.error('Confira os campos destacados no formulário.'))();

  const handleReset = () => {
    form.reset({ ...DEFAULT_FORM_VALUES });
    clearDraft();
    toast.success('Formulário limpo para um novo cadastro.');
  };

  const previewData = toFichaData(watched);

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight sm:text-lg">Gerador de Fichas Cadastrais</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {config.igreja} · {config.ministerio}
              </p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
            PDF A4
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <FichaForm form={form} onReset={handleReset} />
          <SettingsCard
            config={config}
            onConfigChange={setConfig}
            secretaryPhone={secretaryPhone}
            onSecretaryPhoneChange={setSecretaryPhone}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Pré-visualização</h2>
                <p className="text-xs text-muted-foreground">Idêntica ao PDF que será gerado</p>
              </div>
              <span className="shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                210 × 297 mm
              </span>
            </div>

            <FichaPreview data={previewData} config={config} />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                onClick={submit('download')}
                disabled={busy !== null}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {busy === 'download' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Baixar PDF A4
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={submit('whatsapp')}
                disabled={busy !== null}
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {busy === 'whatsapp' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MessageCircle className="size-4" />
                )}
                Enviar por WhatsApp
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              No celular, o PDF vai anexado automaticamente na conversa do secretário.
            </p>
          </Card>
        </div>
      </main>

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
