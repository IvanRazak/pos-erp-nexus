import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTemplates, useUpdateTemplate } from '../integrations/supabase/hooks/templates';

const PdfTemplateEditor = () => {
  const { data: template, isLoading } = useTemplates('pdf');
  const updateTemplate = useUpdateTemplate();

  const handlePdfStylesChange = (newStyles) => {
    try {
      JSON.parse(newStyles); // Validate JSON
      if (!template) return;
      
      updateTemplate.mutate(
        { 
          id: template.id, 
          content: template.content,
          styles: newStyles 
        },
        {
          onSuccess: () => {
            toast.success("Estilos do PDF atualizados com sucesso!");
          },
          onError: (error) => {
            toast.error("Erro ao atualizar estilos: " + error.message);
          }
        }
      );
    } catch (error) {
      toast.error("JSON inválido! Por favor, verifique o formato.");
    }
  };

  const handlePdfTemplateChange = (newTemplate) => {
    if (!template) return;
    
    updateTemplate.mutate(
      { 
        id: template.id, 
        content: newTemplate,
        styles: template.styles 
      },
      {
        onSuccess: () => {
          toast.success("Template do PDF atualizado com sucesso!");
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
        <Button className="w-full">Editar Template do PDF</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Template do PDF</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="styles">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="styles">Estilos</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>
          <TabsContent value="styles">
            <div className="space-y-4">
              <Textarea
                value={template?.styles}
                onChange={(e) => handlePdfStylesChange(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Digite o template JSON aqui..."
              />
              <div className="text-sm text-muted-foreground">
                <p>Dica: Configure os estilos do PDF usando JSON. As propriedades disponíveis são:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>fontSize: Tamanho da fonte</li>
                  <li>margin: Margem/espaçamento</li>
                  <li>indent: Recuo do texto</li>
                </ul>
                <p className="mt-2">Seções disponíveis:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>title: Estilo do título do pedido</li>
                  <li>header: Estilo do cabeçalho (dados do cliente)</li>
                  <li>itemsTitle: Estilo do título da seção de itens</li>
                  <li>item: Estilo dos itens do pedido</li>
                  <li>itemDetails: Estilo dos detalhes dos itens</li>
                  <li>extras: Estilo das opções extras</li>
                  <li>summary: Estilo do título do resumo</li>
                  <li>totals: Estilo dos valores totais</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="content">
            <div className="space-y-4">
              <Textarea
                value={template?.content}
                onChange={(e) => handlePdfTemplateChange(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Digite o template HTML aqui..."
              />
              <div className="text-sm text-muted-foreground">
                <p>Variáveis disponíveis para uso no template:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>{"{order_number}"}: Número do pedido</li>
                  <li>{"{order_date}"}: Data do pedido</li>
                  <li>{"{created_by}"}: Criado por</li>
                  <li>{"{customer_name}"}: Nome do cliente</li>
                  <li>{"{delivery_date}"}: Data de entrega</li>
                  <li>{"{items}"}: Lista de itens do pedido</li>
                  <li>{"{discount}"}: Informações de desconto</li>
                  <li>{"{additional_value}"}: Valor adicional</li>
                  <li>{"{total_amount}"}: Valor total</li>
                  <li>{"{paid_amount}"}: Valor pago</li>
                  <li>{"{payment_option}"}: Opção de pagamento</li>
                  <li>{"{remaining_balance}"}: Saldo restante</li>
                  <li>{"{styles}"}: Estilos CSS (não remover)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PdfTemplateEditor;