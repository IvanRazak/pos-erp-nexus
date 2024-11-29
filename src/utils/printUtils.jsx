import { format, parseISO } from 'date-fns';
import { formatarDimensoes } from './pedidoUtils';
import { supabase } from '../lib/supabase';

const getTemplate = async (type) => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('type', type)
    .single();

  if (error) throw error;
  return data;
};

export const generatePrintContent = async (pedido, itensPedido) => {
  const template = await getTemplate('print');
  if (!template) {
    throw new Error('Template not found');
  }
  
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
        extraText += ' *';
      }
      
      return extraText;
    }).join('<br>');
  };

  const orderDate = pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm') : 'N/A';
  const orderNumber = String(pedido.order_number || '');

  const itemsHtml = itensPedido?.map(item => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras.reduce((sum, extra) => {
      const extraValue = extra.total_value || 0;
      return sum + (extra.extra_option.fixed_value ? extraValue : extraValue * item.quantity);
    }, 0);
    
    return `
    <tr>
      <td>
        ${item.product.name}
        ${item.description ? `<div class="description">Obs: ${item.description}</div>` : ''}
      </td>
      <td>${item.quantity}</td>
      <td>${formatarDimensoes(item)}</td>
      <td>
        R$ ${subtotalProduto.toFixed(2)}
        ${item.discount > 0 ? `<br><span class="discount-info">Desconto: R$ ${item.discount.toFixed(2)}</span>` : ''}
      </td>
      <td>${renderExtras(item.extras, item.quantity) || 'N/A'}</td>
    </tr>
  `}).join('');

  const discountHtml = pedido.discount > 0 ? 
    `<p class="discount-info">Desconto Geral: R$ ${pedido.discount.toFixed(2)}</p>` : '';

  const additionalValueHtml = pedido.additional_value > 0 ? 
    `<p class="discount-info">
      ${pedido.additional_value_description ? `${pedido.additional_value_description}` : ''}: R$ ${pedido.additional_value.toFixed(2)}
    </p>` : '';

  return template.content
    .replace(/{styles}/g, template.styles || '')
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