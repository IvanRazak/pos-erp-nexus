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
  
  const renderExtras = (extras) => {
    if (!extras || extras.length === 0) return 'N/A';
    
    return extras.map((extra) => {
      const extraOption = extra.extra_option;
      if (!extraOption) return '';

      let extraText = `${extraOption.name}: `;
      
      if (extraOption.type === 'select' && extra.selected_option) {
        extraText += `${extra.selected_option.name} (R$ ${extra.total_value?.toFixed(2) || '0.00'})`;
      } else if (extraOption.type === 'number') {
        extraText += `${extra.inserted_value} (R$ ${extra.total_value?.toFixed(2) || '0.00'})`;
      } else {
        extraText += `R$ ${extra.total_value?.toFixed(2) || '0.00'}`;
      }
      
      return extraText;
    }).join('<br>');
  };

  const itemsHtml = itensPedido?.map(item => {
    const subtotalProduto = item.quantity * item.unit_price;
    const subtotalExtras = item.extras?.reduce((sum, extra) => sum + (extra.total_value || 0), 0) || 0;
    const subtotal = subtotalProduto + subtotalExtras - (item.discount || 0);
    
    return `
      <tr>
        <td>
          ${item.product?.name || 'N/A'}
          ${item.description ? `<div class="description">Obs: ${item.description}</div>` : ''}
          ${item.arte_option ? `<div class="description">Arte: ${item.arte_option}</div>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>${formatarDimensoes(item) || 'N/A'}</td>
        <td>${renderExtras(item.extras)}</td>
        <td>
          R$ ${subtotal.toFixed(2)}
          ${item.discount > 0 ? `<br><span class="discount-info">Desconto: R$ ${item.discount.toFixed(2)}</span>` : ''}
        </td>
      </tr>
    `;
  }).join('') || '';

  const discountHtml = pedido.discount > 0 ? 
    `<p class="discount-info">Desconto Geral: R$ ${pedido.discount.toFixed(2)}</p>` : '';

  const additionalValueHtml = pedido.additional_value > 0 ? 
    `<p class="discount-info">
      ${pedido.additional_value_description ? `${pedido.additional_value_description}: ` : ''}
      R$ ${pedido.additional_value.toFixed(2)}
    </p>` : '';

  const orderDate = pedido.created_at ? format(parseISO(pedido.created_at), 'dd/MM/yyyy HH:mm') : 'N/A';
  const deliveryDate = pedido.delivery_date ? format(parseISO(pedido.delivery_date), 'dd/MM/yyyy') : 'N/A';

  let content = template.content
    .replace(/{styles}/g, template.styles || '')
    .replace(/{order_number}/g, pedido.order_number || '')
    .replace(/{order_date}/g, orderDate)
    .replace(/{created_by}/g, pedido.created_by || 'N/A')
    .replace(/{customer_name}/g, pedido.customer?.name || 'N/A')
    .replace(/{delivery_date}/g, deliveryDate)
    .replace(/{items}/g, itemsHtml)
    .replace(/{discount}/g, discountHtml)
    .replace(/{additional_value}/g, additionalValueHtml)
    .replace(/{total_amount}/g, pedido.total_amount?.toFixed(2) || '0.00')
    .replace(/{paid_amount}/g, pedido.paid_amount?.toFixed(2) || '0.00')
    .replace(/{payment_option}/g, pedido.payment_option ? ` (${pedido.payment_option})` : '')
    .replace(/{remaining_balance}/g, pedido.remaining_balance?.toFixed(2) || '0.00');

  return content;
};