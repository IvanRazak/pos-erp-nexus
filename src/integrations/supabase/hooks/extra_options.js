import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) {
    console.error("Erro Supabase:", error.message); // Adiciona log de erro
    throw new Error(error.message);
  }
  return data;
};

// Consultar uma opção extra por ID
export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: async () => {
    const extraOption = await fromSupabase(
      supabase.from('extra_options').select('*').eq('id', id).single()
    );
    const quantityPrices = await fromSupabase(
      supabase.from('extra_option_quantity_prices')
        .select('quantity, price')
        .eq('extra_option_id', id)
        .order('quantity', { ascending: true })
    );
    return { ...extraOption, quantityPrices };
  },
});

// Adicionar novas funções e mutações segue aqui como no original...
