import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import ClienteForm from './ClienteForm';
import BuscarClienteModal from './BuscarClienteModal';
import { toast } from "@/components/ui/use-toast";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';
import { useAuth } from '../hooks/useAuth';
import CarrinhoItem from './CarrinhoItem';

const Venda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [m2, setM2] = useState(0);
  const [desconto, setDesconto] = useState('');
  const [dataEntrega, setDataEntrega] = useState(null);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isExtraOptionsModalOpen, setIsExtraOptionsModalOpen] = useState(false);
  const [valorPago, setValorPago] = useState(0);
  const { data: produtos } = useProducts();
  const { data: clientes } = useCustomers();
  const { data: opcoesExtras } = useExtraOptions();
  const { data: opcoesPagamento } = usePaymentOptions();
  const addOrder = useAddOrder();

  const [isBuscarClienteModalOpen, setIsBuscarClienteModalOpen] = useState(false);
  const [selectedClienteName, setSelectedClienteName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Após 1 segundo, o conteúdo será exibido
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
    setQuantidade(itemToEdit.quantidade);
    setLargura(itemToEdit.largura || '');
    setAltura(itemToEdit.altura || '');
    setM2(itemToEdit.m2 || 0);
    setCarrinho(carrinho.filter(item => item !== itemToEdit));
    setIsExtraOptionsModalOpen(true);
  };

  const adicionarAoCarrinho = () => {
    if (produtoSelecionado) {
      setIsExtraOptionsModalOpen(true);
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente.id);
    setSelectedClienteName(cliente.name);
    setIsBuscarClienteModalOpen(false);
  };


  const handleAdicionarAoCarrinhoComExtras = (extrasEscolhidas) => {
    const m2Total = produtoSelecionado.unit_type === 'square_meter' ? largura * altura : 1;
    const novoItem = {
      ...produtoSelecionado,
      cartItemId: Date.now().toString(), // Add a unique identifier
      quantidade,
      largura,
      altura,
      m2: m2Total,
      total: produtoSelecionado.sale_price * m2Total * quantidade,
      extras: extrasEscolhidas,
    };
    setCarrinho([...carrinho, novoItem]);
    resetProduto();
    setIsExtraOptionsModalOpen(false);
  };

  const resetProduto = () => {
    setProdutoSelecionado(null);
    setQuantidade(1);
    setLargura(0);
    setAltura(0);
    setM2(0);
  };

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((acc, item) => {
      const itemTotal = item.total + item.extras.reduce((extrasTotal, extra) => extrasTotal + extra.price * item.quantidade, 0);
      return acc + itemTotal;
    }, 0);
    return subtotal - desconto;
  };

  const handleNewClientSuccess = () => {
    setIsNewClientDialogOpen(false);
    refetchClientes();
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
        cartItemId: item.cartItemId, // Include the unique identifier
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
              <Select onValueChange={(value) => setProdutoSelecionado(produtos?.find(p => p.id === value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos?.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>{produto.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} className="mt-2" />
              {produtoSelecionado?.unit_type === 'square_meter' && (
                <>
                  <Input type="number" placeholder="Largura" value={largura} onChange={(e) => {
                    const newLargura = parseFloat(e.target.value);
                    setLargura(newLargura);
                    setM2(newLargura * altura);
                  }} className="mt-2" />
                  <Input type="number" placeholder="Altura" value={altura} onChange={(e) => {
                    const newAltura = parseFloat(e.target.value);
                    setAltura(newAltura);
                    setM2(largura * newAltura);
                  }} className="mt-2" />
                  <Input type="number" placeholder="M²" value={m2} readOnly className="mt-2" />
                </>
              )}
              <Button onClick={adicionarAoCarrinho} className="mt-2">Adicionar ao Carrinho</Button>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Selecionar Cliente</h3>
              <div className="flex items-center space-x-2">
                <Input
                  value={selectedClienteName}
                  placeholder="Cliente selecionado"
                  readOnly
                  className="flex-grow"
                />
                <Button onClick={() => setIsBuscarClienteModalOpen(true)}>
                  Buscar Cliente
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-2">Cadastrar Novo Cliente</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cadastro de Cliente</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] w-full rounded-md">
                    <ClienteForm onSuccess={handleNewClientSuccess} />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Carrinho</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>M²</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Extras</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrinho.map((item, index) => (
                  <CarrinhoItem
                    key={index}
                    item={item}
                    onDelete={handleDeleteFromCart}
                    onEdit={handleEditCartItem}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Input type="number" placeholder="Desconto" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value))} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !dataEntrega && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataEntrega ? format(dataEntrega, "PPP") : <span>Selecione a data de entrega</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dataEntrega} onSelect={setDataEntrega} initialFocus />
              </PopoverContent>
            </Popover>
            <Select onValueChange={setOpcaoPagamento} value={opcaoPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Opção de Pagamento" />
              </SelectTrigger>
              <SelectContent>
                {opcoesPagamento?.map((opcao) => (
                  <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Valor Pago" value={valorPago} onChange={(e) => setValorPago(parseFloat(e.target.value))} className="mt-2" />
            <p className="mt-2 text-xl font-bold">Total: R$ {calcularTotal().toFixed(2)}</p>
            <p className="mt-2 text-xl font-bold">Saldo Restante: R$ {(calcularTotal() - valorPago).toFixed(2)}</p>
            <Button className="mt-2" onClick={finalizarVenda}>Finalizar Venda</Button>
          </div>
          <BuscarClienteModal
            isOpen={isBuscarClienteModalOpen}
            onClose={() => setIsBuscarClienteModalOpen(false)}
            onSelectCliente={handleSelectCliente}
          />
          {isExtraOptionsModalOpen && (
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
