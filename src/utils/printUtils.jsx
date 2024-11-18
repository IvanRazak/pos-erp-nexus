import { formatarDimensoes } from './pedidoUtils';

export const generatePrintContent = (pedido, itensPedido) => {
  return `
    <html>
      <head>
        <title>Pedido #${pedido.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; margin-top: 20px; }
          .discount-info { margin-top: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h2>Pedido #${pedido.order_number}</h2>
        <p><strong>Cliente:</strong> ${pedido.customer?.name || 'N/A'}</p>
        <p><strong>Data de Entrega:</strong> ${pedido.delivery_date || 'N/A'}</p>
        
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Dimensões</th>
              <th>Opções Extras</th>
              <th>Desconto Individual</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itensPedido?.map(item => `
              <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unit_price.toFixed(2)}</td>
                <td>${formatarDimensoes(item)}</td>
                <td>${item.extras.map(extra => {
                  let extraText = `${extra.extra_option.name}: `;
                  const extraValue = extra.total_value || 0;
                  
                  if (extra.extra_option.type === 'select' && extra.selected_option) {
                    extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)}`;
                  } else if (extra.extra_option.type === 'number') {
                    extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)}`;
                  } else {
                    extraText += `R$ ${extraValue.toFixed(2)}`;
                  }
                  
                  return extraText;
                }).join('<br>')}</td>
                <td>R$ ${(item.discount || 0).toFixed(2)}</td>
                <td>R$ ${(item.quantity * item.unit_price + 
                  item.extras.reduce((sum, extra) => sum + (extra.total_value || 0), 0) - 
                  (item.discount || 0)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          ${pedido.discount > 0 ? `
            <p class="discount-info">Desconto Geral: R$ ${pedido.discount.toFixed(2)}</p>
          ` : ''}
          ${pedido.additional_value > 0 ? `
            <p class="discount-info">
              Valor Adicional: R$ ${pedido.additional_value.toFixed(2)}
              ${pedido.additional_value_description ? `<br>Descrição: ${pedido.additional_value_description}` : ''}
            </p>
          ` : ''}
          <p>Valor Total: R$ ${pedido.total_amount?.toFixed(2) || '0.00'}</p>
          <p>Valor Pago: R$ ${pedido.paid_amount?.toFixed(2) || '0.00'}</p>
          <p>Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2) || '0.00'}</p>
        </div>
      </body>
    </html>
  `;
};