import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import { useAuth } from '../hooks/useAuth';
import { calcularTotalItem, calcularTotal, resetCarrinho } from '../utils/vendaUtils';
import { format } from "date-fns";
import { toast } from "sonner";
import VendaContent from './venda/VendaContent';

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
  const [isArteModalOpen, setIsArteModalOpen] = useState(false);
  const [tempProduto, setTempProduto] = useState(null);
  const [itemToUpdateArte, setItemToUpdateArte] = useState(null);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [valorPago, setValorPago] = useState(0);
  const [valorAdicional, setValorAdicional] = useState(0);
  const [descricaoValorAdicional, setDescricaoValorAdicional] = useState('');

  const { data: clientes } = useCustomers();
  const { data: opcoesExtras } = useExtraOptions();
  const addOrder = useAddOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) navigate('/login');
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleAdicionarAoCarrinhoComExtras = async (extrasEscolhidas) => {
    const novoItem = {
      ...produtoSelecionado,
      cartItemId: Date.now().toString(),
      extras: extrasEscolhidas,
      total: await calcularTotalItem(produtoSelecionado, extrasEscolhidas),
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
    toast.success("Produto adicionado ao carrinho!");
  };

  const adicionarAoCarrinho = (item, arteOption = null) => {
    const itemComArte = arteOption ? { ...item, arteOption } : item;
    setCarrinho([...carrinho, itemComArte]);
  };

  const handleArteModalConfirm = (arteOption) => {
    if (itemToUpdateArte) {
      setCarrinho(carrinho.map(item => 
        item.cartItemId === itemToUpdateArte.cartItemId 
          ? { ...item, arteOption, quantidade: itemToUpdateArte.quantidade }
          : item
      ));
      setItemToUpdateArte(null);
    } else if (tempProduto) {
      adicionarAoCarrinho({ ...tempProduto, arteOption });
      setTempProduto(null);
    }
    setIsArteModalOpen(false);
  };

  const finalizarVenda = async () => {
    const erros = [];
    if (!clienteSelecionado) erros.push("Selecione um cliente");
    if (carrinho.length === 0) erros.push("O carrinho está vazio");
    if (!dataEntrega) erros.push("Defina uma data de entrega");
    if (!opcaoPagamento) erros.push("Selecione uma opção de pagamento");
    if (valorPago <= 0) erros.push("Insira um valor pago maior que zero");
    
    if (erros.length > 0) {
      toast.error("Não foi possível finalizar a venda:\n\n" + erros.join("\n"));
      return null;
    }
    
    if (!user) {
      toast.error("Erro ao finalizar venda: Usuário não está autenticado.");
      return null;
    }

    try {
      const totalVenda = await calcularTotal(carrinho) - parseFloat(desconto) + parseFloat(valorAdicional);
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
          discount: parseFloat(item.discount) || 0,
        })),
        created_by: user.username,
        discount: parseFloat(desconto) || 0,
        additional_value: parseFloat(valorAdicional) || 0,
        additional_value_description: descricaoValorAdicional,
      };

      const result = await addOrder.mutateAsync(novaVenda);
      toast.success("Venda finalizada com sucesso!");
      resetCarrinho(setCarrinho, setClienteSelecionado, setDataEntrega, setOpcaoPagamento, setDesconto, setValorPago);
      setValorAdicional(0);
      setDescricaoValorAdicional('');
      
      return {
        ...novaVenda,
        cliente: clientes?.find(c => c.id === clienteSelecionado),
        carrinho,
        dataEntrega,
        opcaoPagamento,
        totalVenda,
        valorPago,
        desconto,
        valorAdicional,
        descricaoValorAdicional
      };
    } catch (error) {
      toast.error("Erro ao finalizar venda: " + error.message);
      return null;
    }
  };

  return (
    <VendaContent
      carrinho={carrinho}
      setCarrinho={setCarrinho}
      clienteSelecionado={clienteSelecionado}
      setClienteSelecionado={setClienteSelecionado}
      produtoSelecionado={produtoSelecionado}
      setProdutoSelecionado={setProdutoSelecionado}
      isNewClientDialogOpen={isNewClientDialogOpen}
      setIsNewClientDialogOpen={setIsNewClientDialogOpen}
      isExtraOptionsModalOpen={isExtraOptionsModalOpen}
      setIsExtraOptionsModalOpen={setIsExtraOptionsModalOpen}
      isBuscarClienteModalOpen={isBuscarClienteModalOpen}
      setIsBuscarClienteModalOpen={setIsBuscarClienteModalOpen}
      isBuscarProdutoModalOpen={isBuscarProdutoModalOpen}
      setIsBuscarProdutoModalOpen={setIsBuscarProdutoModalOpen}
      isArteModalOpen={isArteModalOpen}
      setIsArteModalOpen={setIsArteModalOpen}
      tempProduto={tempProduto}
      setTempProduto={setTempProduto}
      itemToUpdateArte={itemToUpdateArte}
      setItemToUpdateArte={setItemToUpdateArte}
      handleAdicionarAoCarrinhoComExtras={handleAdicionarAoCarrinhoComExtras}
      adicionarAoCarrinho={adicionarAoCarrinho}
      handleArteModalConfirm={handleArteModalConfirm}
      finalizarVenda={finalizarVenda}
      clientes={clientes}
      opcoesExtras={opcoesExtras}
    />
  );
};

export default Venda;