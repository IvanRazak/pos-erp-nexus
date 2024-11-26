import { supabase } from './supabase.js';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth.jsx';

// Import all hooks from the hooks directory
import * as customerTypesHooks from './hooks/customer_types';
import * as customersHooks from './hooks/customers';
import * as extraOptionsHooks from './hooks/extra_options';
import * as orderItemExtrasHooks from './hooks/order_item_extras';
import * as orderItemsHooks from './hooks/order_items';
import * as ordersHooks from './hooks/orders';
import * as paymentOptionsHooks from './hooks/payment_options';
import * as paymentsHooks from './hooks/payments';
import * as productsHooks from './hooks/products';
import * as usersHooks from './hooks/users';
import * as eventsLogHooks from './hooks/events_log';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
};

// Export all hooks individually
export const {
  useCustomerType,
  useCustomerTypes,
  useAddCustomerType,
  useUpdateCustomerType,
  useDeleteCustomerType,
} = customerTypesHooks;

export const {
  useCustomer,
  useCustomers,
  useAddCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} = customersHooks;

export const {
  useExtraOption,
  useExtraOptions,
  useAddExtraOption,
  useUpdateExtraOption,
  useDeleteExtraOption,
  useSelectionOptions, // Add this line to export useSelectionOptions
  useAddSelectionOption,
  useUpdateSelectionOption,
  useDeleteSelectionOption,
} = extraOptionsHooks;

export const {
  useOrderItemExtra,
  useOrderItemExtras,
  useAddOrderItemExtra,
  useUpdateOrderItemExtra,
  useDeleteOrderItemExtra,
} = orderItemExtrasHooks;

export const {
  useOrderItem,
  useOrderItems,
  useAddOrderItem,
  useUpdateOrderItem,
  useDeleteOrderItem,
} = orderItemsHooks;

export const {
  useOrder,
  useOrders,
  useAddOrder,
  useUpdateOrder,
  useDeleteOrder,
} = ordersHooks;

export const {
  usePaymentOption,
  usePaymentOptions,
  useAddPaymentOption,
  useUpdatePaymentOption,
  useDeletePaymentOption,
} = paymentOptionsHooks;

export const {
  usePayment,
  usePayments,
  useAddPayment,
  useUpdatePayment,
  useDeletePayment,
  useTransactions,
} = paymentsHooks;

export const {
  useProduct,
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} = productsHooks;

export const {
  useUser,
  useUsers,
  useAddUser,
  useUpdateUser,
  useDeleteUser,
} = usersHooks;

export const {
  useAddEventLog,
} = eventsLogHooks;
