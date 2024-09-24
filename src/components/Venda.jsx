import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";

const Venda = () => {
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [largura, setLargura] = useState(0);
  const [altura, setAltura] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [dataEntrega, setDataEntrega] = useState(new Date());

  const { data: produtos } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, nome: 'Produto 1', precoVenda: 100, tipoUnidade: 'unidade' },
        { id: 2, nome: 'Produto 2', precoVenda: 200, tipoUnidade: 'metroQuadrado' },
      ];
    },
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, nome: 'Cliente 1', telefone: '1234567890' },
        { id: 2, nome: 'Cliente 2', telefone: '0987654321' },
      ];
    },
  });

  const { data: opcoesExtras } = useQuery({
    queryKey: ['opcoesExtras'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, nome: 'Opção Extra 1', preco: 10 },
        { id: 2, nome: 'Opção Extra 2', preco: 20 },
      ];
    },
  });

  const adicionarAoCarrinho = () => {
    if (produtoSelecionado) {
      const quantidadeTotal = produtoSelecionado.tipoUnidade === 'metroQuadrado' ? largura * altura : quantidade;
      const novoItem = {
        ...produtoSelecionado,
        quantidade: quantidadeTotal,
        total: produtoSelecionado.precoVenda * quantidadeTotal,
      };
      setCarrinho([...carrinho, novoItem]);
      setProdutoSelecionado(null);
      setQuantidade(1);
      setLargura(0);
      setAltura(0);
    }
  };

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((acc, item) => acc + item.total, 0);
    return subtotal - desconto;
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Venda</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
          <Select onValueChange={(value) => setProdutoSelecionado(produtos.find(p => p.id === parseInt(value)))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos?.map((produto) => (
                <SelectItem key={produto.id} value={produto.id.toString()}>{produto.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {produtoSelecionado && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-2">Adicionar Opções Extras</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Opções Extras</DialogTitle>
                </DialogHeader>
                {opcoesExtras?.map((opcao) => (
                  <div key={opcao.id} className="flex items-center justify-between">
                    <span>{opcao.nome}</span>
                    <span>R$ {opcao.preco.toFixed(2)}</span>
                    <Button>Adicionar</Button>
                  </div>
                ))}
              </DialogContent>
            </Dialog>
          )}
          {produtoSelecionado?.tipoUnidade === 'metroQuadrado' ? (
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
          <Select onValueChange={(value) => setClienteSelecionado(clientes.find(c => c.id === parseInt(value)))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id.toString()}>{cliente.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!clienteSelecionado && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-2">Cadastrar Novo Cliente</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastro de Cliente</DialogTitle>
                </DialogHeader>
                {/* Adicionar formulário de cadastro de cliente aqui */}
              </DialogContent>
            </Dialog>
          )}
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
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carrinho.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>R$ {item.precoVenda.toFixed(2)}</TableCell>
                <TableCell>R$ {item.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Input type="number" placeholder="Desconto" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value))} />
        <DatePicker
          selected={dataEntrega}
          onSelect={setDataEntrega}
          className="mt-2"
        />
        <Select className="mt-2">
          <SelectTrigger>
            <SelectValue placeholder="Opção de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aVista">À Vista</SelectItem>
            <SelectItem value="parcelado">Parcelado</SelectItem>
            <SelectItem value="parcial">Pagamento Parcial</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-xl font-bold">Total: R$ {calcularTotal().toFixed(2)}</p>
        <Button className="mt-2">Finalizar Venda</Button>
      </div>
    </div>
  );
};

export default Venda;
