// Import all the relevant exports from other files in the supabase directory
import { supabase } from './supabase.js';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth.jsx';

// Import all hooks
import {
  usePayment,
  usePayments,
  useAddPayment,
  useUpdatePayment,
  useDeletePayment
} from './hooks/payments';

import {
  useOrder,
  useOrders,
  useAddOrder,
  useUpdateOrder,
  useDeleteOrder
} from './hooks/orders';

import {
  useCustomer,
  useCustomers,
  useAddCustomer,
  useUpdateCustomer,
  useDeleteCustomer
} from './hooks/customers';

import {
  useProduct,
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct
} from './hooks/products';

import {
  useOrderItemExtra,
  useOrderItemExtras,
  useAddOrderItemExtra,
  useUpdateOrderItemExtra,
  useDeleteOrderItemExtra
} from './hooks/order_item_extras';

import {
  useOrderItem,
  useOrderItems,
  useAddOrderItem,
  useUpdateOrderItem,
  useDeleteOrderItem
} from './hooks/order_items';

import {
  useExtraOption,
  useExtraOptions,
  useAddExtraOption,
  useUpdateExtraOption,
  useDeleteExtraOption
} from './hooks/extra_options';

import {
  useUser,
  useUsers,
  useAddUser,
  useUpdateUser,
  useDeleteUser
} from './hooks/users';

// Export all the imported functions and objects
export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  usePayment,
  usePayments,
  useAddPayment,
  useUpdatePayment,
  useDeletePayment,
  useOrder,
  useOrders,
  useAddOrder,
  useUpdateOrder,
  useDeleteOrder,
  useCustomer,
  useCustomers,
  useAddCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useProduct,
  useProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useOrderItemExtra,
  useOrderItemExtras,
  useAddOrderItemExtra,
  useUpdateOrderItemExtra,
  useDeleteOrderItemExtra,
  useOrderItem,
  useOrderItems,
  useAddOrderItem,
  useUpdateOrderItem,
  useDeleteOrderItem,
  useExtraOption,
  useExtraOptions,
  useAddExtraOption,
  useUpdateExtraOption,
  useDeleteExtraOption,
  useUser,
  useUsers,
  useAddUser,
  useUpdateUser,
  useDeleteUser
};
