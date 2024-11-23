import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from "date-fns";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';
import BuscarClienteModal from './BuscarClienteModal';
import BuscarProdutoModal from './BuscarProdutoModal';
import VendaCarrinho from './VendaCarrinho';
import VendaHeader from './VendaHeader';
import ArteModal from './ArteModal';
import VendaFinalizadaModal from './VendaFinalizadaModal';
import { calcularTotalItem, calcularTotal, resetCarrinho, handleFinalizarVenda } from '../utils/vendaUtils';
import { handleNewClientSuccess, handleSelectCliente, handleSelectProduto } from '../utils/clientUtils';
import { getSheetPrice } from '../utils/productUtils';
import { toast } from "sonner";

const Venda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isExtraOptionsModalOpen, setIsExtraOptionsModalOpen] = useState(false);
  const [isBuscarClienteModalOpen, setIsBuscarClienteModalOpen] = useState(false);
  const [isBuscarProdutoModalOpen, setIsBuscarProdutoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [valorPago, setValorPago] = useState(0);
  const [valorAdicional, setValorAdicional] = useState(0);
  const [descricaoValorAdicional, setDescricaoValorAdicional] = useState('');
  const [isArteModalOpen, setIsArteModalOpen] = useState(false);
  const [tempProduto, setTempProduto] = useState(null);
  const [itemToUpdateArte, setItemToUpdateArte] = useState(null);
  const [vendaFinalizadaModalOpen, setVendaFinalizadaModalOpen] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [itensPedidoFinalizado, setItensPedidoFinalizado] = useState(null);

  const { data: clientes } = useCustomers();
  const { data: opcoesExtras } = useExtraOptions();
  const { data: opcoesPagamento } = usePaymentOptions();
  const addOrder = useAddOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user) navigate('/login');
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const finalizarVenda = async () => {
    const result = await handleFinalizarVenda({
      clienteSelecionado,
      carrinho,
      dataEntrega,
      opcaoPagamento,
      valorPago,
      desconto,
      valorAdicional,
      descricaoValorAdicional,
      user,
      addOrder,
      format,
      toast,
      onSuccess: (pedido, itens) => {
        setPedidoFinalizado(pedido);
        setItensPedidoFinalizado(itens);
        setVendaFinalizadaModalOpen(true);
        resetCarrinho(setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago);
        setValorAdicional(0);
        setDescricaoValorAdicional('');
        toast.success("Venda finalizada com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao finalizar venda: " + error.message);
      }
    });

    if (result) {
      const { pedido, carrinho: itens } = result;
      setPedidoFinalizado(pedido);
      setItensPedidoFinalizado(itens);
      setVendaFinalizadaModalOpen(true);
    }
  };

  const handleDescriptionChange = (item, newDescription) => {
    setCarrinho(carrinho.map(cartItem => 
      cartItem === item ? { ...cartItem, description: newDescription } : cartItem
    ));
  };

  const handleUnitPriceChange = async (item, newUnitPrice) => {
    setCarrinho(carrinho.map(cartItem => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          unitPrice: newUnitPrice,
          total: await calcularTotalItem({ ...cartItem, unitPrice: newUnitPrice }, cartItem.extras)
        };
        return updatedItem;
      }
      return cartItem;
    }));
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity > 1 && newQuantity !== item.quantidade) {
      setItemToUpdateArte({ ...item, quantidade: newQuantity });
      setIsArteModalOpen(true);
    } else {
      await updateItemQuantity(item, newQuantity);
    }
  };

  const updateItemQuantity = async (item, newQuantity) => {
    let newUnitPrice = item.unitPrice;
    if (item.unit_type === 'sheets') {
      const sheetPrice = await getSheetPrice(item.id, newQuantity);
      if (sheetPrice) {
        newUnitPrice = sheetPrice;
      }
    }

    setCarrinho(carrinho.map(cartItem => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          quantidade: newQuantity,
          unitPrice: newUnitPrice,
          total: await calcularTotalItem({ ...cartItem, quantidade: newQuantity, unitPrice: newUnitPrice }, cartItem.extras)
        };
        return updatedItem;
      }
      return cartItem;
    }));
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
        clienteSelecionado={clienteSelecionado}
      />
      <VendaCarrinho
        carrinho={carrinho}
        onDelete={handleDeleteFromCart}
        onEdit={handleEditCartItem}
        desconto={desconto}
        setDesconto={setDesconto}
        dataEntrega={dataEntrega}
        setDataEntrega={setDataEntrega}
        opcaoPagamento={opcaoPagamento}
        setOpcaoPagamento={setOpcaoPagamento}
        opcoesPagamento={opcoesPagamento}
        valorPago={valorPago}
        setValorPago={setValorPago}
        finalizarVenda={finalizarVenda}
        onDescriptionChange={handleDescriptionChange}
        valorAdicional={valorAdicional}
        setValorAdicional={setValorAdicional}
        descricaoValorAdicional={descricaoValorAdicional}
        setDescricaoValorAdicional={setDescricaoValorAdicional}
        onUnitPriceChange={handleUnitPriceChange}
        onQuantityChange={handleQuantityChange}
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
      <VendaFinalizadaModal
        isOpen={vendaFinalizadaModalOpen}
        onClose={() => setVendaFinalizadaModalOpen(false)}
        pedido={pedidoFinalizado}
        itensPedido={itensPedidoFinalizado}
      />
    </div>
  );
};

export default Venda;
