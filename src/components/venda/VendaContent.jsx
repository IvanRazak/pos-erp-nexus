import React, { useState } from 'react';
import VendaHeader from "./VendaHeader";
import VendaCarrinho from "./VendaCarrinho";
import BuscarClienteModal from "../BuscarClienteModal";
import BuscarProdutoModal from "../BuscarProdutoModal";
import ProdutoExtraOptionsModal from "../ProdutoExtraOptionsModal";
import ArteModal from "../ArteModal";
import VendaPrintModal from "./VendaPrintModal";
import { handleNewClientSuccess, handleSelectCliente, handleSelectProduto } from "../../utils/clientUtils";
import { toast } from "sonner";

const VendaContent = ({
  carrinho,
  setCarrinho,
  clienteSelecionado,
  setClienteSelecionado,
  produtoSelecionado,
  setProdutoSelecionado,
  isNewClientDialogOpen,
  setIsNewClientDialogOpen,
  isExtraOptionsModalOpen,
  setIsExtraOptionsModalOpen,
  isBuscarClienteModalOpen,
  setIsBuscarClienteModalOpen,
  isBuscarProdutoModalOpen,
  setIsBuscarProdutoModalOpen,
  isArteModalOpen,
  setIsArteModalOpen,
  tempProduto,
  setTempProduto,
  itemToUpdateArte,
  setItemToUpdateArte,
  handleAdicionarAoCarrinhoComExtras,
  adicionarAoCarrinho,
  handleArteModalConfirm,
  finalizarVenda,
  clientes,
  opcoesExtras
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [vendaFinalizada, setVendaFinalizada] = useState(null);

  const handleFinalizarVenda = async () => {
    try {
      const result = await finalizarVenda();
      if (result) {
        setVendaFinalizada(result);
        setIsPrintModalOpen(true);
      }
    } catch (error) {
      toast.error("Erro ao finalizar venda: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Venda</h2>
      <VendaHeader
        setIsBuscarProdutoModalOpen={setIsBuscarProdutoModalOpen}
        setClienteSelecionado={setClienteSelecionado}
        setIsBuscarClienteModalOpen={setIsBuscarClienteModalOpen}
        isNewClientDialogOpen={isNewClientDialogOpen}
        setIsNewClientDialogOpen={setIsNewClientDialogOpen}
        handleNewClientSuccess={() => handleNewClientSuccess(setIsNewClientDialogOpen)}
        clientes={clientes}
      />
      <VendaCarrinho
        carrinho={carrinho}
        onFinalizarVenda={handleFinalizarVenda}
      />
      <BuscarClienteModal
        isOpen={isBuscarClienteModalOpen}
        onClose={() => setIsBuscarClienteModalOpen(false)}
        onSelectCliente={(cliente) => handleSelectCliente(cliente, setClienteSelecionado, setIsBuscarClienteModalOpen)}
      />
      <BuscarProdutoModal
        isOpen={isBuscarProdutoModalOpen}
        onClose={() => setIsBuscarProdutoModalOpen(false)}
        onSelectProduto={(produto) => handleSelectProduto(produto, setProdutoSelecionado, setIsBuscarProdutoModalOpen, setIsExtraOptionsModalOpen)}
      />
      {isExtraOptionsModalOpen && produtoSelecionado && (
        <ProdutoExtraOptionsModal
          produto={produtoSelecionado}
          opcoesExtras={opcoesExtras}
          onClose={() => setIsExtraOptionsModalOpen(false)}
          onConfirm={handleAdicionarAoCarrinhoComExtras}
        />
      )}
      <ArteModal
        isOpen={isArteModalOpen}
        onClose={() => {
          setIsArteModalOpen(false);
          setItemToUpdateArte(null);
          setTempProduto(null);
        }}
        onConfirm={handleArteModalConfirm}
      />
      <VendaPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        venda={vendaFinalizada}
      />
    </div>
  );
};

export default VendaContent;