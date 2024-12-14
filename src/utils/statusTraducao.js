export const traduzirStatus = (status) => {
  const traducoes = {
    'in_production': 'Em Produção',
    'awaiting_approval': 'Aguardando Aprovação',
    'ready_for_pickup': 'Pronto para Retirada',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado',
    'partial_payment': 'Pagamento Parcial',
  };
  return traducoes[status] || status;
};
