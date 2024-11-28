import { supabase } from '../lib/supabase';
import { format } from "date-fns";
import { generatePrintContent } from './printUtils';
import { toast } from "sonner";

export const createOrder = async (orderData, user) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: orderData.customer_id,
        total_amount: orderData.total_amount,
        paid_amount: orderData.paid_amount,
        remaining_balance: orderData.remaining_balance,
        status: orderData.status,
        delivery_date: orderData.delivery_date,
        payment_option: orderData.payment_option,
        created_by: user.username,
        discount: orderData.discount,
        additional_value: orderData.additional_value,
        additional_value_description: orderData.additional_value_description,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      width: item.width || null,
      height: item.height || null,
      m2: item.m2 || null,
      cart_item_id: item.cartItemId,
      description: item.description,
      arte_option: item.arte_option,
      discount: item.discount || 0,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    const extraOptions = orderData.items.flatMap(item => 
      (item.extras || []).map(extra => ({
        order_item_id: insertedItems.find(i => i.cart_item_id === item.cartItemId).id,
        extra_option_id: extra.id,
        value: extra.value,
        inserted_value: extra.type === 'number' ? parseFloat(extra.value) : null,
        total_value: extra.totalPrice,
        selected_option_id: extra.type === 'select' ? extra.value : null,
      }))
    );

    if (extraOptions.length > 0) {
      const { error: extrasError } = await supabase
        .from('order_item_extras')
        .insert(extraOptions);

      if (extrasError) throw extrasError;
    }

    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        order_id: order.id,
        amount: orderData.paid_amount,
        payment_option: orderData.payment_option,
      }]);

    if (paymentError) throw paymentError;

    return order;
  } catch (error) {
    throw new Error(`Erro ao criar pedido: ${error.message}`);
  }
};

export const fetchOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(name),
      items:order_items(
        *,
        product:products(*),
        extras:order_item_extras(
          *,
          extra_option:extra_options(*),
          selected_option:selection_options(*)
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
};

export const handleOrderPrint = async (orderData) => {
  try {
    const printContent = await generatePrintContent(orderData, orderData.items);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  } catch (error) {
    console.error('Error generating print:', error);
    toast.error("Erro ao gerar impressão: " + error.message);
  }
};