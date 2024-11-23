import { generatePrintContent } from './printUtils';
import { toast } from "sonner";

export const handlePrintPedido = async (pedido, itensPedido) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão');
      return;
    }
    
    const printContent = await generatePrintContent(pedido, itensPedido);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    toast.error('Erro ao gerar impressão: ' + error.message);
  }
};