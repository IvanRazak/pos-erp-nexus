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

  const handlePdfStylesChange = (newStyles) => {
    try {
      // Validate JSON
      JSON.parse(newStyles);
      setPdfStyles(newStyles);
      localStorage.setItem('pdfStyles', newStyles);
      toast.success("Estilos do PDF atualizados com sucesso!");
    } catch (error) {
      toast.error("JSON inválido! Por favor, verifique o formato.");
    }
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
        <div className="space-y-4">
          <Textarea
            value={pdfStyles}
            onChange={(e) => handlePdfStylesChange(e.target.value)}
            className="min-h-[400px] font-mono"
            placeholder="Digite o template JSON aqui..."
          />
          <div className="text-sm text-muted-foreground">
            Dica: Configure os estilos do PDF usando JSON. As propriedades disponíveis são:
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
      </DialogContent>
    </Dialog>
  );
};

export default PdfTemplateEditor;