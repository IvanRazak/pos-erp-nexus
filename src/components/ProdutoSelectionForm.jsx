import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProdutoSelectionForm = ({ produtos, produtoSelecionado, setProdutoSelecionado, quantidade, setQuantidade, largura, setLargura, altura, setAltura, m2, setM2, openBuscarProdutoModal, adicionarAoCarrinho }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Selecionar Produto</h3>
      <div className="flex items-center space-x-2">
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
        <Button onClick={openBuscarProdutoModal}>
          Buscar Produto
        </Button>
      </div>
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
  );
};

export default ProdutoSelectionForm;