import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from '../lib/supabase';
import { getExtraOptionPrice } from '../utils/vendaUtils';
import { generatePrintContent } from '../utils/printUtils';
import jsPDF from 'jspdf';
import PedidoDetalhesHeader from './pedidos/PedidoDetalhesHeader';
import PedidoDetalhesContent from './pedidos/PedidoDetalhesContent';

const PedidoDetalhesModal = ({ pedido, onClose }) => {
  const { data: itensPedido, isLoading } = useQuery({
    queryKey: ['pedidoItens', pedido.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*),
          extras:order_item_extras(
            id,
            extra_option:extra_options(
              id, 
              name, 
              type, 
              price,
              use_quantity_pricing,
              fixed_value
            ),
            value,
            inserted_value,
            total_value,
            selected_option:selection_options(id, name, value)
          )
        `)
        .eq('order_id', pedido.id);

      if (error) throw error;

      for (const item of data) {
        for (const extra of item.extras) {
          if (extra.extra_option.use_quantity_pricing) {
            extra.total_value = await getExtraOptionPrice(
              {
                ...extra.extra_option,
                value: extra.inserted_value,
                totalPrice: extra.total_value
              },
              item.quantity
            );
          }
        }
      }

      return data;
    },
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = generatePrintContent(pedido, itensPedido);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const printContent = generatePrintContent(pedido, itensPedido);
    
    // Get custom template from localStorage
    const customTemplate = localStorage.getItem('printTemplate');
    const content = customTemplate || printContent;
    
    // Remove HTML tags and convert to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Get PDF styles from localStorage or use defaults
    const pdfStyles = JSON.parse(localStorage.getItem('pdfStyles') || '{}');
    const defaultStyles = {
      title: { fontSize: 16, margin: 20 },
      header: { fontSize: 12, margin: 10 },
      itemsTitle: { fontSize: 14, margin: 20 },
      item: { fontSize: 12, margin: 7, indent: 15 },
      itemDetails: { fontSize: 10, margin: 7, indent: 20 },
      extras: { fontSize: 10, margin: 7, indent: 25 },
      summary: { fontSize: 14, margin: 10, indent: 10 },
      totals: { fontSize: 12, margin: 7, indent: 15 }
    };
    
    const styles = { ...defaultStyles, ...pdfStyles };
    
    // Apply styles and content from template
    let y = styles.title.margin;
    doc.setFontSize(styles.title.fontSize);
    doc.text(`Pedido #${pedido.order_number}`, 10, y);
    
    // Header
    y += styles.header.margin;
    doc.setFontSize(styles.header.fontSize);
    doc.text(`Cliente: ${pedido.customer?.name || 'N/A'}`, 10, y);
    y += styles.header.margin;
    doc.text(`Data do Pedido: ${pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : 'N/A'}`, 10, y);
    y += styles.header.margin;
    doc.text(`Data de Entrega: ${pedido.delivery_date ? new Date(pedido.delivery_date).toLocaleDateString() : 'N/A'}`, 10, y);
    
    // Items
    y += styles.itemsTitle.margin;
    doc.setFontSize(styles.itemsTitle.fontSize);
    doc.text('Itens do Pedido:', 10, y);
    
    y += styles.item.margin;
    itensPedido?.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(styles.item.fontSize);
      doc.text(`${index + 1}. ${item.product.name}`, styles.item.indent, y);
      y += styles.itemDetails.margin;
      
      doc.setFontSize(styles.itemDetails.fontSize);
      doc.text(`Quantidade: ${item.quantity}`, styles.itemDetails.indent, y);
      y += styles.itemDetails.margin;
      
      if (item.width && item.height) {
        doc.text(`Dimensões: ${item.width}m x ${item.height}m`, styles.itemDetails.indent, y);
        y += styles.itemDetails.margin;
      }
      
      if (item.m2) {
        doc.text(`M²: ${item.m2.toFixed(2)}`, styles.itemDetails.indent, y);
        y += styles.itemDetails.margin;
      }
      
      doc.text(`Valor Unitário: R$ ${item.unit_price.toFixed(2)}`, styles.itemDetails.indent, y);
      y += styles.itemDetails.margin;
      
      if (item.extras?.length > 0) {
        doc.text('Opções Extras:', styles.itemDetails.indent, y);
        y += styles.extras.margin;
        
        item.extras.forEach(extra => {
          const extraText = `- ${extra.extra_option.name}: R$ ${(extra.total_value || 0).toFixed(2)}`;
          doc.setFontSize(styles.extras.fontSize);
          doc.text(extraText, styles.extras.indent, y);
          y += styles.extras.margin;
        });
      }
      
      if (item.discount > 0) {
        doc.text(`Desconto: R$ ${item.discount.toFixed(2)}`, styles.itemDetails.indent, y);
        y += styles.itemDetails.margin;
      }
      
      const subtotal = (item.quantity * item.unit_price) - (item.discount || 0);
      doc.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, styles.itemDetails.indent, y);
      y += styles.item.margin;
    });
    
    // Summary
    if (y > 250) {
      doc.addPage();
      y = styles.summary.margin;
    }
    
    doc.setFontSize(styles.summary.fontSize);
    doc.text('Resumo:', styles.summary.indent, y);
    y += styles.totals.margin;
    
    doc.setFontSize(styles.totals.fontSize);
    if (pedido.discount > 0) {
      doc.text(`Desconto Geral: R$ ${pedido.discount.toFixed(2)}`, styles.totals.indent, y);
      y += styles.totals.margin;
    }
    
    if (pedido.additional_value > 0) {
      doc.text(`Valor Adicional: R$ ${pedido.additional_value.toFixed(2)}`, styles.totals.indent, y);
      if (pedido.additional_value_description) {
        doc.text(`Descrição: ${pedido.additional_value_description}`, styles.totals.indent, y + styles.totals.margin);
        y += styles.totals.margin * 2;
      } else {
        y += styles.totals.margin;
      }
    }
    
    doc.text(`Valor Total: R$ ${pedido.total_amount?.toFixed(2) || '0.00'}`, styles.totals.indent, y);
    y += styles.totals.margin;
    doc.text(`Valor Pago: R$ ${pedido.paid_amount?.toFixed(2) || '0.00'}`, styles.totals.indent, y);
    y += styles.totals.margin;
    doc.text(`Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2) || '0.00'}`, styles.totals.indent, y);
    
    doc.save(`pedido-${pedido.order_number}.pdf`);
  };

  const renderExtras = (extras, itemQuantity) => {
    return extras.map((extra) => {
      let extraText = `${extra.extra_option.name}: `;
      const extraValue = extra.total_value || 0;
      
      if (extra.extra_option.type === 'select' && extra.selected_option) {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      } else if (extra.extra_option.type === 'number') {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)} = R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      } else {
        if (extra.extra_option.fixed_value) {
          extraText += `R$ ${extraValue.toFixed(2)}`;
        } else {
          extraText += `R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${(extraValue * itemQuantity).toFixed(2)}`;
        }
      }
      
      if (extra.extra_option.use_quantity_pricing) {
        extraText += ' *';
      }
      
      return <div key={extra.id}>{extraText}</div>;
    });
  };

  const calcularTotalDescontos = () => {
    const descontosIndividuais = itensPedido.reduce((sum, item) => sum + (item.discount || 0), 0);
    const descontoGeral = pedido.discount || 0;
    return descontosIndividuais + descontoGeral;
  };

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-0">
        <PedidoDetalhesHeader 
          pedido={pedido}
          onPrint={handlePrint}
          onExportPDF={handleExportPDF}
        />
        <PedidoDetalhesContent 
          itensPedido={itensPedido}
          pedido={pedido}
          renderExtras={renderExtras}
          calcularTotalDescontos={calcularTotalDescontos}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalhesModal;