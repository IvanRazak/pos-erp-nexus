import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import ClienteForm from './ClienteForm';
import { toast } from "@/components/ui/use-toast";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';
import { useAuth } from '../hooks/useAuth';
import BuscarClienteModal from './BuscarClienteModal';
import BuscarProdutoModal from './BuscarProdutoModal';
import VendaCarrinho from './VendaCarrinho';

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
  const { data: produtos } = useProducts();
  const { data: clientes } = useCustomers();
  const { data: opcoesExtras } = useExtraOptions();
  const { data: opcoesPagamento } = usePaymentOptions();
  const addOrder = useAddOrder();

  const [isLoading, setIsLoading] = useState(true);

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

  const handleAdicionarAoCarrinhoComExtras = (extrasEscolhidas) => {
    const novoItem = {
      ...produtoSelecionado,
      cartItemId: Date.now().toString(),
      extras: extrasEscolhidas,
      total: calcularTotalItem(produtoSelecionado, extrasEscolhidas),
    };
    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setIsExtraOptionsModalOpen(false);
  };

  const calcularTotalItem = (item, extras) => {
    const precoBase = item.unit_type === 'square_meter' ? item.sale_price * item.m2 : item.sale_price;
    const precoExtras = extras.reduce((total, extra) => total + extra.price, 0);
    return (precoBase + precoExtras) * item.quantidade;
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.total, 0);
  };

  const handleNewClientSuccess = () => {
    setIsNewClientDialogOpen(false);
    // Aqui você pode adicionar lógica para atualizar a lista de clientes, se necessário
  };

  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente.id);
    setIsBuscarClienteModalOpen(false);
  };

  const handleSelectProduto = (produto) => {
    setProdutoSelecionado(produto);
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
    const totalVenda = calcularTotal();
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
        unit_price: item.sale_price,
        extras: item.extras,
        width: item.largura,
        height: item.altura,
        m2: item.m2,
        cartItemId: item.cartItemId,
      })),
      created_by: user.username,
      discount: parseFloat(desconto) || 0,
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
    setDataEntrega(null);
    setOpcaoPagamento('');
    setDesconto(0);
    setValorPago(0);
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

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Venda</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
              <Button onClick={() => setIsBuscarProdutoModalOpen(true)}>
                Buscar Produto
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Selecionar Cliente</h3>
              <div className="flex items-center space-x-2">
                <Select onValueChange={setClienteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsBuscarClienteModalOpen(true)}>
                  Buscar Cliente
                </Button>
              </div>
              <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-2">Cadastrar Novo Cliente</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastro de Cliente</DialogTitle>
                  </DialogHeader>
                  <ClienteForm onSuccess={handleNewClientSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
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
            calcularTotal={calcularTotal}
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
              onConfirm={handleAdicionarAoCarrinhoComExtras}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Venda;
