import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const Produtos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      // Simular uma chamada à API
      return [
        { id: 1, nome: 'Produto 1', precoVenda: 100, precoCusto: 50, descricao: 'Descrição 1', quantidadeVias: 1, cores: 'Azul', formato: 'A4', impressao: 'Frente', tipoUnidade: 'unidade' },
        { id: 2, nome: 'Produto 2', precoVenda: 200, precoCusto: 100, descricao: 'Descrição 2', quantidadeVias: 2, cores: 'Vermelho', formato: 'A3', impressao: 'Frente e Verso', tipoUnidade: 'pacote' },
      ];
    },
  });

  const cadastrarProdutoMutation = useMutation({
    mutationFn: async (novoProduto) => {
      // Simular uma chamada à API para cadastrar o produto
      console.log('Cadastrando produto:', novoProduto);
      return { id: Date.now(), ...novoProduto };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['produtos']);
      toast({
        title: "Produto cadastrado com sucesso!",
        description: "O novo produto foi adicionado à lista.",
      });
      setIsDialogOpen(false);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const novoProduto = Object.fromEntries(formData.entries());
    cadastrarProdutoMutation.mutate(novoProduto);
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Produtos</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Cadastrar Novo Produto</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastro de Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="nome" placeholder="Nome do Produto" required />
            <Input name="precoVenda" type="number" placeholder="Preço de Venda" required />
            <Input name="precoCusto" type="number" placeholder="Preço de Custo" required />
            <Input name="descricao" placeholder="Descrição" required />
            <Input name="quantidadeVias" type="number" placeholder="Quantidade de Vias" required />
            <Input name="cores" placeholder="Cores" required />
            <Input name="formato" placeholder="Formato" required />
            <Select name="impressao" required>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Impressão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frente">Frente</SelectItem>
                <SelectItem value="frenteVerso">Frente e Verso</SelectItem>
              </SelectContent>
            </Select>
            <Select name="tipoUnidade" required>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="pacote">Pacote</SelectItem>
                <SelectItem value="metroQuadrado">Metro Quadrado</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Cadastrar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço de Venda</TableHead>
            <TableHead>Preço de Custo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Quantidade de Vias</TableHead>
            <TableHead>Cores</TableHead>
            <TableHead>Formato</TableHead>
            <TableHead>Impressão</TableHead>
            <TableHead>Tipo de Unidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell>{produto.nome}</TableCell>
              <TableCell>{produto.precoVenda}</TableCell>
              <TableCell>{produto.precoCusto}</TableCell>
              <TableCell>{produto.descricao}</TableCell>
              <TableCell>{produto.quantidadeVias}</TableCell>
              <TableCell>{produto.cores}</TableCell>
              <TableCell>{produto.formato}</TableCell>
              <TableCell>{produto.impressao}</TableCell>
              <TableCell>{produto.tipoUnidade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Produtos;
