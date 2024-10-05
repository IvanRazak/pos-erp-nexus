import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from "@/components/ui/use-toast";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';
import BuscarClienteModal from './BuscarClienteModal';
import BuscarProdutoModal from './BuscarProdutoModal';
import VendaCarrinho from './VendaCarrinho';
import VendaHeader from './VendaHeader';
import { calcularTotal, resetCarrinho, handleAdicionarAoCarrinhoComExtras, prepararNovaVenda } from '../utils/vendaUtils';

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

  const { data: produtos } = useProducts();
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

  const handleDeleteFromCart = (itemToDelete) => {
    setCarrinho(carrinho.filter(item => item !== itemToDelete));
  };

  const handleEditCartItem = (itemToEdit) => {
    setProdutoSelecionado(itemToEdit);
    setCarrinho(carrinho.filter(item => item !== itemToEdit));
    setIsExtraOptionsModalOpen(true);
  };

  const handleAdicionarAoCarrinho = (extrasEscolhidas) => {
    handleAdicionarAoCarrinhoComExtras(produtoSelecionado, extrasEscolhidas, setCarrinho);
    setProdutoSelecionado(null);
    setIsExtraOptionsModalOpen(false);
  };

  const handleNewClientSuccess = () => {
    setIsNewClientDialogOpen(false);
  };

  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente.id);
    setIsBuscarClienteModalOpen(false);
  };

  const handleSelectProduto = (produto) => {
    setProdutoSelecionado(produto);
    setIsBuscarProdutoModalOpen(false);
    setIsExtraOptionsModalOpen(true);
  };

  const finalizarVenda = async () => {
    const erros = [];
    if (!clienteSelecionado) erros.push("Selecione um cliente");
    if (carrinho.length === 0) erros.push("O carrinho está vazio");
    if (!dataEntrega) erros.push("Defina uma data de entrega");
    if (!opcaoPagamento) erros.push("Selecione uma opção de pagamento");
    if (valorPago <= 0) erros.push("Insira um valor pago maior que zero");
    if (erros.length > 0) {
      alert("Não foi possível finalizar a venda:\n\n" + erros.join("\n"));
      return;
    }
    if (!user) {
      toast({
        title: "Erro ao finalizar venda",
        description: "Usuário não está autenticado.",
        variant: "destructive",
      });
      return;
    }
    
    const novaVenda = prepararNovaVenda(clienteSelecionado, () => calcularTotal(carrinho), valorPago, dataEntrega, opcaoPagamento, carrinho, user, desconto);
    
    try {
      await addOrder.mutateAsync(novaVenda);
      toast({
        title: "Venda finalizada com sucesso!",
        description: "A nova venda foi registrada no sistema.",
      });
      resetCarrinho(setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago);
    } catch (error) {
      toast({
        title: "Erro ao finalizar venda",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Venda</h2>
      <VendaHeader
        setIsBuscarProdutoModalOpen={setIsBuscarProdutoModalOpen}
        setClienteSelecionado={setClienteSelecionado}
        setIsBuscarClienteModalOpen={setIsBuscarClienteModalOpen}
        isNewClientDialogOpen={isNewClientDialogOpen}
        setIsNewClientDialogOpen={setIsNewClientDialogOpen}
        handleNewClientSuccess={handleNewClientSuccess}
        clientes={clientes}
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
        calcularTotal={() => calcularTotal(carrinho)}
        finalizarVenda={finalizarVenda}
      />
      <BuscarClienteModal
        isOpen={isBuscarClienteModalOpen}
        onClose={() => setIsBuscarClienteModalOpen(false)}
        onSelectCliente={handleSelectCliente}
      />
      <BuscarProdutoModal
        isOpen={isBuscarProdutoModalOpen}
        onClose={() => setIsBuscarProdutoModalOpen(false)}
        onSelectProduto={handleSelectProduto}
      />
      {isExtraOptionsModalOpen && produtoSelecionado && (
        <ProdutoExtraOptionsModal
          produto={produtoSelecionado}
          opcoesExtras={opcoesExtras}
          onClose={() => setIsExtraOptionsModalOpen(false)}
          onConfirm={handleAdicionarAoCarrinho}
        />
      )}
    </div>
  );
};

export default Venda;