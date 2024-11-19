import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PrintTemplateEditor = () => {
  const [printStyles, setPrintStyles] = React.useState(
    localStorage.getItem('printStyles') || `
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total { font-weight: bold; margin-top: 20px; }
    .discount-info { margin-top: 10px; color: #666; }
    .description { font-style: italic; color: #666; margin-top: 4px; }
  `);

  const [printTemplate, setPrintTemplate] = React.useState(
    localStorage.getItem('printTemplate') || `
    <html>
      <head>
        <title>Pedido #{order_number}</title>
        <style>{styles}</style>
      </head>
      <body>
        <h2>Pedido #{order_number}</h2>
        <p><strong>Cliente:</strong> {customer_name}</p>
        <p><strong>Data de Entrega:</strong> {delivery_date}</p>
        
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Dimensões</th>
              <th>Opções Extras</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>

        <div class="total">
          {discount}
          {additional_value}
          <p>Valor Total: R$ {total_amount}</p>
          <p>Valor Pago: R$ {paid_amount} {payment_option}</p>
          <p>Saldo Restante: R$ {remaining_balance}</p>
        </div>
      </body>
    </html>
  `);

  const handlePrintStylesChange = (newStyles) => {
    setPrintStyles(newStyles);
    localStorage.setItem('printStyles', newStyles);
    toast.success("Estilos de impressão atualizados com sucesso!");
  };

  const handlePrintTemplateChange = (newTemplate) => {
    setPrintTemplate(newTemplate);
    localStorage.setItem('printTemplate', newTemplate);
    toast.success("Template de impressão atualizado com sucesso!");
  };

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
                value={printTemplate}
                onChange={(e) => handlePrintTemplateChange(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Digite o template HTML aqui..."
              />
              <div className="text-sm text-muted-foreground">
                Dica: Use as seguintes variáveis no template:
                <ul className="list-disc pl-4 mt-2">
                  <li>{`{order_number}`} - Número do pedido</li>
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
                value={printStyles}
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