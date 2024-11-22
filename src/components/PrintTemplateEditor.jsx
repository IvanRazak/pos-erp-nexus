import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTemplates, useUpdateTemplate } from '../integrations/supabase/hooks/templates';

const PrintTemplateEditor = () => {
  const { data: template, isLoading } = useTemplates('print');
  const updateTemplate = useUpdateTemplate();

  const handlePrintStylesChange = (newStyles) => {
    if (!template) return;
    
    updateTemplate.mutate(
      { 
        id: template.id, 
        content: template.content,
        styles: newStyles 
      },
      {
        onSuccess: () => {
          toast.success("Estilos de impressão atualizados com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao atualizar estilos: " + error.message);
        }
      }
    );
  };

  const handlePrintTemplateChange = (newTemplate) => {
    if (!template) return;
    
    updateTemplate.mutate(
      { 
        id: template.id, 
        content: newTemplate,
        styles: template.styles 
      },
      {
        onSuccess: () => {
          toast.success("Template de impressão atualizado com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao atualizar template: " + error.message);
        }
      }
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Editar Template de Impressão</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Template de Impressão</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML Template</TabsTrigger>
            <TabsTrigger value="css">CSS Styles</TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <div className="space-y-4">
              <Textarea
                value={template?.content}
                onChange={(e) => handlePrintTemplateChange(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Digite o template HTML aqui..."
              />
              <div className="text-sm text-muted-foreground">
                Dica: Use as seguintes variáveis no template:
                <ul className="list-disc pl-4 mt-2">
                  <li>{`{order_number}`} - Número do pedido</li>
                  <li>{`{order_date}`} - Data e hora do pedido</li>
                  <li>{`{created_by}`} - Usuário que criou o pedido</li>
                  <li>{`{customer_name}`} - Nome do cliente</li>
                  <li>{`{delivery_date}`} - Data de entrega</li>
                  <li>{`{items}`} - Lista de itens do pedido</li>
                  <li>{`{total_amount}`} - Valor total</li>
                  <li>{`{paid_amount}`} - Valor pago</li>
                  <li>{`{payment_option}`} - Forma de pagamento</li>
                  <li>{`{remaining_balance}`} - Saldo restante</li>
                  <li>{`{styles}`} - Estilos CSS</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="css">
            <div className="space-y-4">
              <Textarea
                value={template?.styles}
                onChange={(e) => handlePrintStylesChange(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Digite os estilos CSS aqui..."
              />
              <div className="text-sm text-muted-foreground">
                Dica: Use CSS para personalizar a aparência da impressão. As classes disponíveis são:
                <ul className="list-disc pl-4 mt-2">
                  <li>table - Estilo da tabela principal</li>
                  <li>th, td - Estilo das células</li>
                  <li>.total - Estilo da seção de total</li>
                  <li>.discount-info - Estilo das informações de desconto</li>
                  <li>.description - Estilo das descrições de produtos</li>
                  <li>.order-info - Estilo das informações do pedido</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PrintTemplateEditor;