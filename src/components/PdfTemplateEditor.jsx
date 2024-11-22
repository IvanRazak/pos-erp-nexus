import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PdfTemplateEditor = () => {
  const [pdfStyles, setPdfStyles] = React.useState(
    localStorage.getItem('pdfStyles') || `
    {
      "title": {
        "fontSize": 16,
        "margin": 20
      },
      "header": {
        "fontSize": 12,
        "margin": 10
      },
      "itemsTitle": {
        "fontSize": 14,
        "margin": 20
      },
      "item": {
        "fontSize": 12,
        "margin": 7,
        "indent": 15
      },
      "itemDetails": {
        "fontSize": 10,
        "margin": 7,
        "indent": 20
      },
      "extras": {
        "fontSize": 10,
        "margin": 7,
        "indent": 25
      },
      "summary": {
        "fontSize": 14,
        "margin": 10,
        "indent": 10
      },
      "totals": {
        "fontSize": 12,
        "margin": 7,
        "indent": 15
      }
    }
  `);

  const [pdfTemplate, setPdfTemplate] = React.useState(
    localStorage.getItem('printTemplate') || `
    <html>
      <head>
        <title>Pedido #{order_number}</title>
        <style>{styles}</style>
      </head>
      <body>
        <h2>Pedido #{order_number}</h2>
        <div class="order-info">
          <p><strong>Data do Pedido:</strong> {order_date}</p>
          <p><strong>Criado por:</strong> {created_by}</p>
        </div>
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

  const handlePdfStylesChange = (newStyles) => {
    try {
      JSON.parse(newStyles);
      setPdfStyles(newStyles);
      localStorage.setItem('pdfStyles', newStyles);
      toast.success("Estilos do PDF atualizados com sucesso!");
    } catch (error) {
      toast.error("JSON inválido! Por favor, verifique o formato.");
    }
  };

  const handlePdfTemplateChange = (newTemplate) => {
    setPdfTemplate(newTemplate);
    localStorage.setItem('printTemplate', newTemplate);
    toast.success("Template do PDF atualizado com sucesso!");
  };

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
                value={pdfStyles}
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
                value={pdfTemplate}
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