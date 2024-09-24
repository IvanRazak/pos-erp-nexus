import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useCustomers, useExtraOptions, usePaymentOptions, useAddOrder } from '../integrations/supabase';
import ClienteForm from './ClienteForm';
import { toast } from "@/components/ui/use-toast";
import ProdutoExtraOptionsModal from './ProdutoExtraOptionsModal';

const Venda = () => {
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [largura, setLargura] = useState(0);
  const [altura, setAltura] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isExtraOptionsModalOpen, setIsExtraOptionsModalOpen] = useState(false);

  const { data: produtos } = useProducts();
  const { data: clientes, refetch: refetchClientes } = useCustomers();
  const { data: opcoesExtras } = useExtraOptions();
  const { data: opcoesPagamento } = usePaymentOptions();
  const addOrder = useAddOrder();

  const adicionarAoCarrinho = () => {
    if (produtoSelecionado) {
      setIsExtraOptionsModalOpen(true);
    }
  };

  const handleAdicionarAoCarrinhoComExtras = (extrasEscolhidas) => {
    const quantidadeTotal = produtoSelecionado.unit_type === 'square_meter' ? largura * altura : quantidade;
    const novoItem = {
      ...produtoSelecionado,
      quantidade: quantidadeTotal,
      total: produtoSelecionado.sale_price * quantidadeTotal,
      extras: extrasEscolhidas,
    };
    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setQuantidade(1);
    setLargura(0);
    setAltura(0);
    setIsExtraOptionsModalOpen(false);
  };

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((acc, item) => {
      const itemTotal = item.total + item.extras.reduce((extrasTotal, extra) => extrasTotal + extra.price, 0);
      return acc + itemTotal;
    }, 0);
    return subtotal - desconto;
  };

  const handleNewClientSuccess = () => {
    setIsNewClientDialogOpen(false);
    refetchClientes();
  };

  const finalizarVenda = async () => {
    if (!clienteSelecionado || carrinho.length === 0 || !dataEntrega || !opcaoPagamento) {
      toast({
        title: "Erro ao finalizar venda",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const novaVenda = {
      customer_id: clienteSelecionado,
      total_amount: calcularTotal(),
      status: 'in_production',
      delivery_date: format(dataEntrega, 'yyyy-MM-dd'),
      payment_option: opcaoPagamento.toLowerCase(),
      items: carrinho.map(item => ({
        product_id: item.id,
        quantity: item.quantidade,
        unit_price: item.sale_price,
        extras: item.extras,
      })),
    };

    try {
      await addOrder.mutateAsync(novaVenda);
      toast({
        title: "Venda finalizada com sucesso!",
        description: "A nova venda foi registrada no sistema.",
      });
      setCarrinho([]);
      setClienteSelecionado(null);
      setDataEntrega(null);
      setOpcaoPagamento('');
      setDesconto(0);
    } catch (error) {
      toast({
        title: "Erro ao finalizar venda",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Venda</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
          <Select onValueChange={(value) => setProdutoSelecionado(produtos.find(p => p.id === value))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos?.map((produto) => (
                <SelectItem key={produto.id} value={produto.id}>{produto.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {produtoSelecionado?.unit_type === 'square_meter' ? (
            <>
              <Input type="number" placeholder="Largura" value={largura} onChange={(e) => setLargura(parseFloat(e.target.value))} className="mt-2" />
              <Input type="number" placeholder="Altura" value={altura} onChange={(e) => setAltura(parseFloat(e.target.value))} className="mt-2" />
            </>
          ) : (
            <Input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value))} className="mt-2" />
          )}
          <Button onClick={adicionarAoCarrinho} className="mt-2">Adicionar ao Carrinho</Button>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Selecionar Cliente</h3>
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
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Carrinho</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Preço Unitário</TableHead>
              <TableHead>Extras</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carrinho.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>R$ {item.sale_price.toFixed(2)}</TableCell>
                <TableCell>
                  {item.extras.map((extra, i) => (
                    <div key={i}>{extra.name}: R$ {extra.price.toFixed(2)}</div>
                  ))}
                </TableCell>
                <TableCell>R$ {(item.total + item.extras.reduce((acc, extra) => acc + extra.price, 0)).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Input type="number" placeholder="Desconto" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value))} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dataEntrega && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataEntrega ? format(dataEntrega, "PPP") : <span>Selecione a data de entrega</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dataEntrega}
              onSelect={setDataEntrega}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select onValueChange={setOpcaoPagamento} className="mt-2">
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            {opcoesPagamento?.map((opcao) => (
              <SelectItem key={opcao.id} value={opcao.name}>{opcao.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-xl font-bold">Total: R$ {calcularTotal().toFixed(2)}</p>
        <Button className="mt-2" onClick={finalizarVenda}>Finalizar Venda</Button>
      </div>
      {isExtraOptionsModalOpen && (
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
