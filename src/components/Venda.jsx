import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';
import BuscarClienteModal from './BuscarClienteModal';
import BuscarProdutoModal from './BuscarProdutoModal';
import VendaCarrinho from './VendaCarrinho';
import VendaHeader from './VendaHeader';
import ArteModal from './ArteModal';
import { calcularTotalItem, calcularTotal, resetCarrinho } from '../utils/vendaUtils';
import { handleNewClientSuccess, handleSelectCliente, handleSelectProduto } from '../utils/clientUtils';

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

  const handleAdicionarAoCarrinhoComExtras = (extrasEscolhidas) => {
    const novoItem = {
      ...produtoSelecionado,
      cartItemId: Date.now().toString(),
      extras: extrasEscolhidas,
      total: calcularTotalItem(produtoSelecionado, extrasEscolhidas),
      description: '',
    };
    
    if (novoItem.quantidade > 1) {
      setTempProduto(novoItem);
      setIsArteModalOpen(true);
    } else {
      adicionarAoCarrinho(novoItem);
    }
    
    setProdutoSelecionado(null);
    setIsExtraOptionsModalOpen(false);
  };

  const adicionarAoCarrinho = (item, arteOption = null) => {
    const itemComArte = arteOption ? { ...item, arteOption } : item;
    setCarrinho([...carrinho, itemComArte]);
  };

  const handleArteModalConfirm = (arteOption) => {
    adicionarAoCarrinho(tempProduto, arteOption);
    setTempProduto(null);
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
    const totalVenda = calcularTotal(carrinho, desconto) + parseFloat(valorAdicional);
    const saldoRestante = totalVenda - valorPago;
    const novaVenda = {
      customer_id: clienteSelecionado,
      total_amount: totalVenda,
      paid_amount: valorPago,
      remaining_balance: saldoRestante,
      status: saldoRestante > 0 ? 'partial_payment' : 'in_production',
      delivery_date: format(dataEntrega, 'yyyy-MM-dd'),
      payment_option: opcaoPagamento,
      items: carrinho.map(item => ({
        product_id: item.id,
        quantity: item.quantidade,
        unit_price: item.unitPrice || item.sale_price,
        extras: item.extras,
        width: item.largura,
        height: item.altura,
        m2: item.m2,
        cartItemId: item.cartItemId,
        description: item.description,
        arte_option: item.arteOption || null,
      })),
      created_by: user.username,
      discount: parseFloat(desconto) || 0,
      additional_value: parseFloat(valorAdicional) || 0,
      additional_value_description: descricaoValorAdicional,
    };
    try {
      await addOrder.mutateAsync(novaVenda);
      toast({
        title: "Venda finalizada com sucesso!",
        description: "A nova venda foi registrada no sistema.",
      });
      resetCarrinho(setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago);
      setValorAdicional(0);
      setDescricaoValorAdicional('');
    } catch (error) {
      toast({
        title: "Erro ao finalizar venda",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDescriptionChange = (item, newDescription) => {
    setCarrinho(carrinho.map(cartItem => 
      cartItem === item ? { ...cartItem, description: newDescription } : cartItem
    ));
  };

  const handleUnitPriceChange = (item, newUnitPrice) => {
    setCarrinho(carrinho.map(cartItem => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          unitPrice: newUnitPrice,
          total: calcularTotalItem({ ...cartItem, unitPrice: newUnitPrice }, cartItem.extras)
        };
        return updatedItem;
      }
      return cartItem;
    }));
  };

  const handleQuantityChange = (item, newQuantity) => {
    setCarrinho(carrinho.map(cartItem => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          quantidade: newQuantity,
          total: calcularTotalItem({ ...cartItem, quantidade: newQuantity }, cartItem.extras)
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
        calcularTotal={() => calcularTotal(carrinho, desconto) + parseFloat(valorAdicional)}
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
        onClose={() => setIsArteModalOpen(false)}
        onConfirm={handleArteModalConfirm}
      />
    </div>
  );
};

export default Venda;
