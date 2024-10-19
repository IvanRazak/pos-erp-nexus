import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useProduct = (id) => useQuery({
  queryKey: ['products', id],
  queryFn: async () => {
    const product = await fromSupabase(supabase.from('products').select('*').eq('id', id).single());
    if (product.unit_type === 'sheets') {
      const sheetPrices = await fromSupabase(supabase.from('product_sheet_prices').select('*').eq('product_id', id));
      product.sheet_prices = sheetPrices;
    }
    return product;
  },
});

export const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: () => fromSupabase(supabase.from('products').select('*')),
});

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct) => {
      const { sheet_prices, ...productData } = newProduct;
      const { data: product, error } = await supabase.from('products').insert([productData]).select().single();
      if (error) throw error;
      
      if (product.unit_type === 'sheets' && sheet_prices) {
        const sheetPricesData = sheet_prices.map(price => ({
          product_id: product.id,
          quantity: price.quantity,
          price: price.price
        }));
        const { error: sheetPricesError } = await supabase.from('product_sheet_prices').insert(sheetPricesData);
        if (sheetPricesError) throw sheetPricesError;
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { sheet_prices, ...productData } = updateData;
      const { data: product, error } = await supabase.from('products').update(productData).eq('id', id).select().single();
      if (error) throw error;
      
      if (product.unit_type === 'sheets' && sheet_prices) {
        await supabase.from('product_sheet_prices').delete().eq('product_id', id);
        const sheetPricesData = sheet_prices.map(price => ({
          product_id: id,
          quantity: price.quantity,
          price: price.price
        }));
        const { error: sheetPricesError } = await supabase.from('product_sheet_prices').insert(sheetPricesData);
        if (sheetPricesError) throw sheetPricesError;
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('products').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};