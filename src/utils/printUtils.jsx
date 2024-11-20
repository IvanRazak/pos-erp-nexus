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
        extraText += ' ';
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
    .order-info { margin-bottom: 20px; color: #666; }
  `;

  const template = localStorage.getItem('printTemplate') || `
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
  `;

  const itemsHtml = itensPedido?.map(item => {
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
  `}).join('');

  const discountHtml = pedido.discount > 0 ? 
    `<p class="discount-info">Desconto Geral: R$ ${pedido.discount.toFixed(2)}</p>` : '';

  const additionalValueHtml = pedido.additional_value > 0 ? 
    `<p class="discount-info">
      Valor Adicional: R$ ${pedido.additional_value.toFixed(2)}
      ${pedido.additional_value_description ? `<br>Descrição: ${pedido.additional_value_description}` : ''}
    </p>` : '';

  const orderDate = pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm') : 'N/A';

  // Convert order_number to string to ensure it's not undefined
  const orderNumber = String(pedido.order_number || '');

  return template
    .replace(/{styles}/g, customStyles)
    .replace(/{order_number}/g, orderNumber)
    .replace(/{order_date}/g, orderDate)
    .replace(/{created_by}/g, pedido.created_by || 'N/A')
    .replace(/{customer_name}/g, pedido.customer?.name || 'N/A')
    .replace(/{delivery_date}/g, pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd/MM/yyyy') : 'N/A')
    .replace(/{items}/g, itemsHtml)
    .replace(/{discount}/g, discountHtml)
    .replace(/{additional_value}/g, additionalValueHtml)
    .replace(/{total_amount}/g, pedido.total_amount?.toFixed(2) || '0.00')
    .replace(/{paid_amount}/g, pedido.paid_amount?.toFixed(2) || '0.00')
    .replace(/{payment_option}/g, pedido.payment_option ? `(${pedido.payment_option})` : '')
    .replace(/{remaining_balance}/g, pedido.remaining_balance?.toFixed(2) || '0.00');
};
