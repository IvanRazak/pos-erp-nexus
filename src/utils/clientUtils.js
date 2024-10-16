export const handleNewClientSuccess = (setIsNewClientDialogOpen) => {
  setIsNewClientDialogOpen(false);
};

export const handleSelectCliente = (cliente, setClienteSelecionado, setIsBuscarClienteModalOpen) => {
  setClienteSelecionado(cliente.id);
  setIsBuscarClienteModalOpen(false);
};