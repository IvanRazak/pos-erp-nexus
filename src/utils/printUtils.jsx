import { format } from "date-fns";

export const generatePrintContent = (pedido, itensPedido) => {
  const formatCurrency = (value) => `R$ ${value.toFixed(2)}`;

  const renderExtras = (extras, itemQuantity) => {
    return extras.map((extra) => {
      let extraText = `${extra.extra_option.name}: `;
      const extraValue = extra.total_value || 0;
      
      if (extra.extra_option.type === 'select' && extra.selected_option) {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.selected_option.name} - ${formatCurrency(extraValue)}`;
        } else {
          extraText += `${extra.selected_option.name} - ${formatCurrency(extraValue)} x ${itemQuantity} = ${formatCurrency(extraValue * itemQuantity)}`;
        }
      } else if (extra.extra_option.type === 'number') {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.inserted_value} x ${formatCurrency(extraValue / extra.inserted_value)} = ${formatCurrency(extraValue)}`;
        } else {
          extraText += `${extra.inserted_value} x ${formatCurrency(extraValue / extra.inserted_value)} x ${itemQuantity} = ${formatCurrency(extraValue * itemQuantity)}`;
        }
      } else {
        if (extra.extra_option.fixed_value) {
          extraText += formatCurrency(extraValue);
        } else {
          extraText += `${formatCurrency(extraValue)} x ${itemQuantity} = ${formatCurrency(extraValue * itemQuantity)}`;
        }
      }
      
      return `<div>${extraText}</div>`;
    }).join('');
  };

  const calcularSubtotalItem = (item) => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras.reduce((sum, extra) => {
      const extraValue = extra.total_value || 0;
      if (extra.extra_option.fixed_value) {
        return sum + extraValue;
      }
      return sum + (extraValue * item.quantity);
    }, 0);
    return subtotalProduto + subtotalExtras - (item.discount || 0);
  };

  const formatarDimensoes = (item) => {
    if (item.width && item.height) {
      return `${item.width}m x ${item.height}m`;
    }
    return item.product?.format || 'N/A';
  };

  const formatarM2 = (item) => {
    if (item.m2) {
      return `${item.m2.toFixed(2)}m²`;
    }
    return 'N/A';
  };

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pedido #${pedido.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .info { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; margin-top: 10px; }
          .extras { margin-left: 20px; font-size: 0.9em; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Pedido #${pedido.order_number}</div>
          <div class="info">Data do Pedido: ${format(new Date(pedido.created_at), 'dd/MM/yyyy')}</div>
          <div class="info">Data de Entrega: ${pedido.delivery_date ? format(new Date(pedido.delivery_date), 'dd/MM/yyyy') : 'N/A'}</div>
          <div class="info">Cliente: ${pedido.customer?.name || 'N/A'}</div>
          <div class="info">Forma de Pagamento: ${pedido.payment_option || 'N/A'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Dimensões</th>
              <th>M²</th>
              <th>Extras</th>
              <th>Arte</th>
              <th>Desconto</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itensPedido?.map(item => `
              <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${formatarDimensoes(item)}</td>
                <td>${formatarM2(item)}</td>
                <td>${renderExtras(item.extras, item.quantity)}</td>
                <td>${item.arte_option || 'N/A'}</td>
                <td>${formatCurrency(item.discount || 0)}</td>
                <td>${formatCurrency(calcularSubtotalItem(item))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          ${pedido.discount > 0 ? `<div>Desconto Geral: ${formatCurrency(pedido.discount)}</div>` : ''}
          ${pedido.additional_value > 0 ? `
            <div>Valor Adicional: ${formatCurrency(pedido.additional_value)}</div>
            ${pedido.additional_value_description ? `<div>Descrição: ${pedido.additional_value_description}</div>` : ''}
          ` : ''}
          <div>Valor Total: ${formatCurrency(pedido.total_amount)}</div>
          <div>Valor Pago: ${formatCurrency(pedido.paid_amount)}</div>
          <div>Saldo Restante: ${formatCurrency(pedido.remaining_balance)}</div>
        </div>
      </body>
    </html>
  `;

  return content;
};