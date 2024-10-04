import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CarrinhoItem from './CarrinhoItem';

const VendaCarrinho = ({ carrinho, onDelete, onEdit, total, opcoesPagamento, onFinalizarVenda }) => {
  const [desconto, setDesconto] = useState('');
  const [dataEntrega, setDataEntrega] = useState(null);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const [valorPago, setValorPago] = useState(0);

  const handleFinalizarVenda = () => {
    onFinalizarVenda({
      desconto,
      dataEntrega,
      opcaoPagamento,
      valorPago: parseFloat(valorPago)
    });
  };

  return (
    <div>
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
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 space-y-2">
        <Input type="number" placeholder="Desconto" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
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
        <Input type="number" placeholder="Valor Pago" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
        <p className="text-xl font-bold">Total: R$ {total.toFixed(2)}</p>
        <p className="text-xl font-bold">Saldo Restante: R$ {(total - parseFloat(valorPago)).toFixed(2)}</p>
        <Button onClick={handleFinalizarVenda}>Finalizar Venda</Button>
      </div>
    </div>
  );
};

export default VendaCarrinho;