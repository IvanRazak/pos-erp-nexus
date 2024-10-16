export const handleNewClientSuccess = (setIsNewClientDialogOpen) => {
  setIsNewClientDialogOpen(false);
};

export const handleSelectCliente = (cliente, setClienteSelecionado, setIsBuscarClienteModalOpen) => {
  setClienteSelecionado(cliente.id);
  setIsBuscarClienteModalOpen(false);
};

export const handleSelectProduto = (produto, setProdutoSelecionado, setIsBuscarProdutoModalOpen, setIsExtraOptionsModalOpen) => {
  setProdutoSelecionado(produto);
  setIsBuscarProdutoModalOpen(false);
  setIsExtraOptionsModalOpen(true);
};