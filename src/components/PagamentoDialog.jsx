import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../hooks/useAuth';
import { createSystemLog } from '../utils/logUtils';
import { useAddSystemLog } from '../integrations/supabase/hooks/system_logs';

const PagamentoDialog = ({ pedido, valorPagamento, setValorPagamento, opcaoPagamento, setOpcaoPagamento, opcoesPagamento, handlePagamento }) => {
  const { user } = useAuth();
  const addSystemLog = useAddSystemLog();

  const handleSubmitPagamento = async () => {
    try {
      await handlePagamento();
      
      await createSystemLog(addSystemLog, {
        userId: user.id,
        username: user.email,
        action: 'create',
        tableName: 'payments',
        recordId: pedido.id,
        description: `Pagamento de R$ ${valorPagamento} registrado para o pedido ${pedido.order_number} usando ${opcaoPagamento}`
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar log do pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Pagar</Button>
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
          <Button onClick={handleSubmitPagamento}>Confirmar Pagamento</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoDialog;