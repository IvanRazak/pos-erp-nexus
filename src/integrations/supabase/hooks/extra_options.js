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

// Consultar uma opção extra por ID e preços por quantidade
export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: async () => {
    // Consulta a opção extra
    const extraOption = await fromSupabase(
      supabase.from('extra_options').select('*').eq('id', id).single()
    );
    
    // Consulta os preços por quantidade da tabela extra_option_quantity_prices
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

// Adicionar nova opção extra e gerenciar preços por quantidade
export const useAddExtraOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newExtraOption) => {
      const { quantityPrices, ...extraOptionData } = newExtraOption;
      const { data: extraOption, error } = await supabase.from('extra_options').insert([extraOptionData]).select().single();
      if (error) throw error;

      // Insere os preços por quantidade, se necessário
      if (extraOption.use_quantity_pricing && quantityPrices) {
        const quantityPricesData = quantityPrices.map(price => ({
          extra_option_id: extraOption.id,
          quantity: price.quantity,
          price: price.price
        }));
        const { error: quantityPricesError } = await supabase.from('extra_option_quantity_prices').insert(quantityPricesData);
        if (quantityPricesError) throw quantityPricesError;
      }
      
      return extraOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extra_options']);
    },
  });
};

// Outras funções como update e delete seguem o mesmo padrão...
