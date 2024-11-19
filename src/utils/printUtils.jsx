import { format, parseISO } from 'date-fns';
import { formatarDimensoes } from './pedidoUtils';

export const generatePrintContent = (pedido, itensPedido) => {
  const renderExtras = (extras, itemQuantity) => {
    if (!extras || extras.length === 0) return '';
    
    return extras.map((extra) => {
      let extraText = `${extra.extra_option.name}: `;
      const extraValue = extra.total_value || 0;
      
      if (extra.extra_option.type === 'select' && extra.selected_option) {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)}`;
        } else {
          const totalValue = extraValue * itemQuantity;
          extraText += `${extra.selected_option.name} - R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${totalValue.toFixed(2)}`;
        }
      } else if (extra.extra_option.type === 'number') {
        if (extra.extra_option.fixed_value) {
          extraText += `${extra.inserted_value} x R$ ${(extraValue / extra.inserted_value).toFixed(2)} = R$ ${extraValue.toFixed(2)}`;
        } else {
          const unitPrice = extraValue / extra.inserted_value;
          const totalValue = extraValue * itemQuantity;
          extraText += `${extra.inserted_value} x R$ ${unitPrice.toFixed(2)} x ${itemQuantity} = R$ ${totalValue.toFixed(2)}`;
        }
      } else {
        if (extra.extra_option.fixed_value) {
          extraText += `R$ ${extraValue.toFixed(2)}`;
        } else {
          const totalValue = extraValue * itemQuantity;
          extraText += `R$ ${extraValue.toFixed(2)} x ${itemQuantity} = R$ ${totalValue.toFixed(2)}`;
        }
      }
      
      if (extra.extra_option.use_quantity_pricing) {
        extraText += ' (Preço por quantidade)';
      }
      
      return extraText;
    }).join('<br>');
  };

  const customStyles = localStorage.getItem('printStyles') || `
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total { font-weight: bold; margin-top: 20px; }
    .discount-info { margin-top: 10px; color: #666; }
    .description { font-style: italic; color: #666; margin-top: 4px; }
  `;

  return `
    <html>
      <head>
        <title>Pedido #${pedido.order_number}</title>
        <style>${customStyles}</style>
      </head>
      <body>
        <h2>Pedido #${pedido.order_number}</h2>
        <p><strong>Cliente:</strong> ${pedido.customer?.name || 'N/A'}</p>
        <p><strong>Data de Entrega:</strong> ${pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd-MM-yyyy') : 'N/A'}</p>
        
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
            ${itensPedido?.map(item => {
              const subtotalProduto = item.quantity * item.unit_price;
              const subtotalExtras = item.extras.reduce((sum, extra) => {
                const extraValue = extra.total_value || 0;
                return sum + (extra.extra_option.fixed_value ? extraValue : extraValue * item.quantity);
              }, 0);
              const subtotalComDesconto = subtotalProduto + subtotalExtras - (item.discount || 0);
              
              return `
              <tr>
                <td>
                  ${item.product.name}
                  ${item.description ? `<div class="description">Obs: ${item.description}</div>` : ''}
                </td>
                <td>${item.quantity}</td>
                <td>${formatarDimensoes(item)}</td>
                <td>${renderExtras(item.extras, item.quantity) || 'N/A'}</td>
                <td>
                  R$ ${subtotalComDesconto.toFixed(2)}
                  ${item.discount > 0 ? `<br><span class="discount-info">Desconto: R$ ${item.discount.toFixed(2)}</span>` : ''}
                </td>
              </tr>
            `}).join('')}
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
          <p>Valor Pago: R$ ${pedido.paid_amount?.toFixed(2) || '0.00'} 
             ${pedido.payment_option ? `(${pedido.payment_option})` : ''}</p>
          <p>Saldo Restante: R$ ${pedido.remaining_balance?.toFixed(2) || '0.00'}</p>
        </div>
      </body>
    </html>
  `;
};