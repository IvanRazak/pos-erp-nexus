import React, { useState } from 'react';
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageSizeSelector from './ui/page-size-selector';

const FinanceiroTable = ({ pedidos, opcoesPagamento, handlePagamento }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [valorPagamento, setValorPagamento] = useState(0);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handlePagamentoClick = async () => {
    await handlePagamento(pedidoSelecionado, valorPagamento, opcaoPagamento);
    setPedidoSelecionado(null);
    setValorPagamento(0);
    setOpcaoPagamento('');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PageSizeSelector pageSize={itemsPerPage} onPageSizeChange={handlePageSizeChange} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número do Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Pago</TableHead>
            <TableHead>Saldo Restante</TableHead>
            <TableHead>Data do Pedido</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.order_number}</TableCell>
              <TableCell>{pedido.customer?.name || 'N/A'}</TableCell>
              <TableCell>R$ {pedido.total_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.paid_amount.toFixed(2)}</TableCell>
              <TableCell>R$ {pedido.remaining_balance.toFixed(2)}</TableCell>
              <TableCell>{format(parseISO(pedido.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setPedidoSelecionado(pedido)}>Pagar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pagamento do Saldo Restante</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Saldo Restante: R$ {pedido.remaining_balance.toFixed(2)}</p>
                      <Input
                        type="number"
                        placeholder="Valor do Pagamento"
                        value={valorPagamento}
                        onChange={(e) => setValorPagamento(parseFloat(e.target.value))}
                      />
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
                      <Button onClick={handlePagamentoClick}>Confirmar Pagamento</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, pedidos.length)} de {pedidos.length} registros
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroTable;