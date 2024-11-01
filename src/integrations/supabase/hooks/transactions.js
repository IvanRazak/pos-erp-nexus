import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error, status } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders(
            id,
            order_number,
            status,
            customer:customers(
              name
            )
          )
        `)
        .eq('cancelled', false); // Corrigindo o filtro de cancelamento

      // Verificação aprimorada de erro
      if (error || status !== 200) {
        console.error("Erro ao buscar transações:", error);
        throw new Error(error?.message || "Erro desconhecido ao buscar transações");
      }
      return data;
    },
  });
};
