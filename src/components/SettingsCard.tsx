import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maskPhone, type ChurchConfig } from '@/lib/ficha';

interface SettingsCardProps {
  config: ChurchConfig;
  onConfigChange: (config: ChurchConfig) => void;
  secretaryPhone: string;
  onSecretaryPhoneChange: (phone: string) => void;
}

/**
 * Ajustes do rodapé/cabeçalho da ficha e do contato do secretário.
 * Tudo é salvo no localStorage — vira ferramenta reutilizável entre igrejas.
 */
export function SettingsCard({ config, onConfigChange, secretaryPhone, onSecretaryPhoneChange }: SettingsCardProps) {
  const set = (key: keyof ChurchConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onConfigChange({ ...config, [key]: e.target.value });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configurações</CardTitle>
        <CardDescription>Cabeçalho/rodapé da ficha e WhatsApp do secretário. Salvo neste navegador.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-sm">Igreja</Label>
          <Input value={config.igreja} onChange={set('igreja')} placeholder="Nome da igreja" />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Ministério</Label>
          <Input value={config.ministerio} onChange={set('ministerio')} placeholder="Nome do ministério" />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Endereço da igreja</Label>
          <Input value={config.endereco} onChange={set('endereco')} placeholder="Estrada, lote, quadra..." />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Pastor presidente</Label>
          <Input value={config.pastor} onChange={set('pastor')} placeholder="Nome do pastor" />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block text-sm">WhatsApp do secretário</Label>
          <Input
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={secretaryPhone}
            onChange={e => onSecretaryPhoneChange(maskPhone(e.target.value))}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Usado no botão “Enviar por WhatsApp”: no celular o PDF vai anexado automaticamente; em navegadores sem
            suporte, abrimos a conversa com a mensagem pronta.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
