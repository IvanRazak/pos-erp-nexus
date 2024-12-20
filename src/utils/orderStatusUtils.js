import { supabase } from '../lib/supabase';

export const getOrderStatus = async (totalAmount, paidAmount) => {
  try {
    const { data: settings, error } = await supabase
      .from('order_status_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching order status settings:', error);
      return 'pending';
    }

    if (!settings) {
      return 'pending';
    }

    if (paidAmount === 0 && !settings.allow_zero_payment) {
      throw new Error('Pagamentos com valor zero não são permitidos');
    }

    if (paidAmount === 0) {
      return settings.zero_payment_status;
    }

    if (paidAmount < totalAmount) {
      return settings.partial_payment_status;
    }

    return settings.full_payment_status;
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
};