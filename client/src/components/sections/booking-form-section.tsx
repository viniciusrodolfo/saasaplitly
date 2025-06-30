import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, Save, Facebook, MessageCircle, Copy, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { copyToClipboard } from '@/lib/utils';

const colorPresets = [
  { name: 'Blue', bg: '#6366F1', button: '#10B981' },
  { name: 'Purple', bg: '#8B5CF6', button: '#F59E0B' },
  { name: 'Green', bg: '#10B981', button: '#3B82F6' },
  { name: 'Pink', bg: '#EC4899', button: '#8B5CF6' },
  { name: 'Orange', bg: '#F97316', button: '#10B981' },
  { name: 'Red', bg: '#EF4444', button: '#6366F1' },
];

export default function BookingFormSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: 'Agendar Consulta',
    description: 'Cadastre-se com suas informações de contato e marque um horário para ser atendido.',
    backgroundColor: '#6366F1',
    buttonColor: '#10B981',
  });

  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const { data: existingForm, isLoading } = useQuery({
    queryKey: ['/api/booking-form'],
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/booking-form', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/booking-form'] });
      toast({
        title: "Formulário atualizado",
        description: "Suas configurações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar formulário",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (existingForm && typeof existingForm === 'object') {
      setFormData({
        title: (existingForm as any).title || 'Agendar Consulta',
        description: (existingForm as any).description || 'Cadastre-se com suas informações de contato e marque um horário para ser atendido.',
        backgroundColor: (existingForm as any).backgroundColor || '#6366F1',
        buttonColor: (existingForm as any).buttonColor || '#10B981',
      });
    }
  }, [existingForm]);

  const handleSave = () => {
    updateFormMutation.mutate(formData);
  };

  const handleShare = async (platform: string) => {
    const url = `${window.location.origin}/book/${user?.id}`;
    
    if (platform === 'copy') {
      try {
        await copyToClipboard(url);
        toast({
          title: "Link copiado",
          description: "O link do formulário foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao copiar o link.",
          variant: "destructive",
        });
      }
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Agende sua consulta: ${url}`)}`, '_blank');
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: preset.bg,
      buttonColor: preset.button,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Formulário de Agendamento</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Personalize seu formulário público de agendamento
          </p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="customize" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Personalizar</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Formulário</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do formulário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Digite a descrição do formulário"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Cores Predefinidas</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.bg }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.button }}
                          />
                          <span className="text-sm">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          placeholder="#6366F1"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonColor">Cor do Botão</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="buttonColor"
                          type="color"
                          value={formData.buttonColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                          className="w-16 h-10 p-1 rounded"
                        />
                        <Input
                          value={formData.buttonColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                          placeholder="#10B981"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave}
                    disabled={updateFormMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateFormMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>

                {/* Mini Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Visualização Rápida</Label>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={previewTheme === 'light' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewTheme('light')}
                      >
                        <Sun className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewTheme === 'dark' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewTheme('dark')}
                      >
                        <Moon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-6 rounded-lg border-2 transition-all ${
                      previewTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                    }`}
                    style={{ 
                      background: previewTheme === 'light' 
                        ? `linear-gradient(135deg, ${formData.backgroundColor}22, ${formData.backgroundColor}11)`
                        : `linear-gradient(135deg, ${formData.backgroundColor}33, ${formData.backgroundColor}22)`
                    }}
                  >
                    <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                    <p className="text-sm mb-4 opacity-80">{formData.description}</p>
                    
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
                      
                      <button
                        className="w-full py-2 px-4 rounded text-white font-medium"
                        style={{ backgroundColor: formData.buttonColor }}
                      >
                        Agendar Consulta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Visualização Completa</h3>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={previewTheme === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewTheme('light')}
                  >
                    <Sun className="w-4 h-4 mr-1" />
                    Claro
                  </Button>
                  <Button
                    variant={previewTheme === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewTheme('dark')}
                  >
                    <Moon className="w-4 h-4 mr-1" />
                    Escuro
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <iframe
                    src={`/book/${user?.id}?theme=${previewTheme}`}
                    className="w-full h-96 border rounded-lg"
                    title="Preview do Formulário"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>Compartilhe Seu Formulário de Agendamento</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL de Agendamento</Label>
            <div className="flex space-x-2">
              <Input
                value={`${window.location.origin}/book/${user?.id}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" onClick={() => handleShare('copy')}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleShare('facebook')}
              className="flex-1"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Compartilhar no Facebook
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleShare('whatsapp')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}