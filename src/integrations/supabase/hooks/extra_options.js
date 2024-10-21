export const useExtraOption = (id) => useQuery({
  queryKey: ['extra_options', id],
  queryFn: async () => {
    // Consulta a opção extra
    const extraOption = await fromSupabase(
      supabase.from('extra_options').select('*').eq('id', id).single()
    );
    
    // Log para verificar se a opção extra foi carregada corretamente
    console.log("Opção extra carregada do Supabase:", extraOption);
    
    // Consulta os preços por quantidade da tabela extra_option_quantity_prices
    const quantityPrices = await fromSupabase(
      supabase.from('extra_option_quantity_prices')
        .select('quantity, price') // Obtém as colunas quantity e price
        .eq('extra_option_id', id)  // Filtra pelos preços relacionados à extra_option
        .order('quantity', { ascending: true }) // Ordena por quantidade
    );

    // Log para verificar os dados de preços por quantidade
    console.log("Preços por quantidade carregados do Supabase:", quantityPrices);
    
    // Retorna a opção extra com os preços por quantidade
    return { ...extraOption, quantityPrices };
  },
});
