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
    // Consulta a opção extra
    const extraOption = await fromSupabase(
      supabase.from('extra_options').select('*').eq('id', id).single()
    );
    // Consulta os preços por quantidade
    const quantityPrices = await fromSupabase(
      supabase.from('extra_option_quantity_prices')
        .select('quantity, price') // Obtém as colunas quantity e price
        .eq('extra_option_id', id)  // Filtra pelos preços relacionados à extra_option
        .order('quantity', { ascending: true }) // Ordena por quantidade
    );
    
    // Retorna a opção extra com os preços por quantidade
    return { ...extraOption, quantityPrices };
  },
});
