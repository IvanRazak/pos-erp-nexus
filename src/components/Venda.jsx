import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import VendaForm from './VendaForm';
import VendaCarrinho from './VendaCarrinho';
import BuscarClienteModal from './BuscarClienteModal';
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';

const Venda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [isExtraOptionsModalOpen, setIsExtraOptionsModalOpen] = useState(false);
  const [isBuscarClienteModalOpen, setIsBuscarClienteModalOpen] = useState(false);
  const [selectedClienteName, setSelectedClienteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { data: produtos, isLoading: isLoadingProdutos } = useProducts();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();
  const { data: opcoesExtras, isLoading: isLoadingOpcoesExtras } = useExtraOptions();
  const { data: opcoesPagamento, isLoading: isLoadingOpcoesPagamento } = usePaymentOptions();
  const addOrder = useAddOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
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

  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente.id);
    setSelectedClienteName(cliente.name);
    setIsBuscarClienteModalOpen(false);
  };

  const handleAdicionarAoCarrinhoComExtras = (extrasEscolhidas) => {
    const m2Total = produtoSelecionado.unit_type === 'square_meter' ? produtoSelecionado.largura * produtoSelecionado.altura : 1;
    const novoItem = {
      ...produtoSelecionado,
      cartItemId: Date.now().toString(),
      m2: m2Total,
      total: produtoSelecionado.sale_price * m2Total * produtoSelecionado.quantidade,
      extras: extrasEscolhidas,
    };
    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setIsExtraOptionsModalOpen(false);
  };

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((acc, item) => {
      const itemTotal = item.total + item.extras.reduce((extrasTotal, extra) => extrasTotal + extra.price * item.quantidade, 0);
      return acc + itemTotal;
    }, 0);
    return subtotal;
  };

  const finalizarVenda = async (formData) => {
    if (!user) {
      toast({
        title: "Erro ao finalizar venda",
        description: "Usuário não está autenticado.",
        variant: "destructive",
      });
      return;
    }
    const totalVenda = calcularTotal();
    const saldoRestante = totalVenda - formData.valorPago;
    const novaVenda = {
      customer_id: clienteSelecionado,
      total_amount: totalVenda,
      paid_amount: formData.valorPago,
      remaining_balance: saldoRestante,
      status: saldoRestante > 0 ? 'partial_payment' : 'in_production',
      delivery_date: format(formData.dataEntrega, 'yyyy-MM-dd'),
      payment_option: formData.opcaoPagamento,
      items: carrinho.map(item => ({
        product_id: item.id,
        quantity: item.quantidade,
        unit_price: item.sale_price,
        extras: item.extras,
        width: item.largura,
        height: item.altura,
        m2: item.m2,
        cartItemId: item.cartItemId,
      })),
      created_by: user.username,
      discount: parseFloat(formData.desconto) || 0,
    };
    try {
      await addOrder.mutateAsync(novaVenda);
      toast({
        title: "Venda finalizada com sucesso!",
        description: "A nova venda foi registrada no sistema.",
      });
      resetCarrinho();
    } catch (error) {
      toast({
        title: "Erro ao finalizar venda",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetCarrinho = () => {
    setCarrinho([]);
    setClienteSelecionado(null);
    setSelectedClienteName('');
  };

  if (isLoading || isLoadingProdutos || isLoadingClientes || isLoadingOpcoesExtras || isLoadingOpcoesPagamento) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Venda</h2>
      <VendaForm
        produtos={produtos}
        selectedClienteName={selectedClienteName}
        onOpenBuscarCliente={() => setIsBuscarClienteModalOpen(true)}
        onProdutoSelect={(produto) => {
          setProdutoSelecionado(produto);
          setIsExtraOptionsModalOpen(true);
        }}
      />
      <VendaCarrinho
        carrinho={carrinho}
        onDelete={handleDeleteFromCart}
        onEdit={handleEditCartItem}
        total={calcularTotal()}
        opcoesPagamento={opcoesPagamento}
        onFinalizarVenda={finalizarVenda}
      />
      <BuscarClienteModal
        isOpen={isBuscarClienteModalOpen}
        onClose={() => setIsBuscarClienteModalOpen(false)}
        onSelectCliente={handleSelectCliente}
      />
      {isExtraOptionsModalOpen && produtoSelecionado && (
        <ProdutoExtraOptionsModal
          produto={produtoSelecionado}
          opcoesExtras={opcoesExtras}
          onClose={() => setIsExtraOptionsModalOpen(false)}
          onConfirm={handleAdicionarAoCarrinhoComExtras}
        />
      )}
    </div>
  );
};

export default Venda;