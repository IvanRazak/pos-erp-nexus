import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateOrder, useAddPayment } from '../integrations/supabase';
import { useAddSystemLog } from '../integrations/supabase/hooks/system_logs';
import { createSystemLog } from '../utils/logUtils';
import { useAuth } from '../hooks/useAuth';
import { toast } from "@/components/ui/use-toast";

const ProcessarPagamentoModal = ({ pedido, opcoesPagamento, onClose }) => {
  const [valorPagamento, setValorPagamento] = useState(0);
  const [opcaoPagamento, setOpcaoPagamento] = useState('');
  const updateOrder = useUpdateOrder();
  const addPayment = useAddPayment();
  const addSystemLog = useAddSystemLog();
  const { user } = useAuth();

  const handlePagamento = async () => {
    if (valorPagamento <= 0 || !opcaoPagamento) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    const novoSaldoRestante = pedido.remaining_balance - valorPagamento;
    const novoPagamentoTotal = pedido.paid_amount + valorPagamento;

    try {
      const orderUpdate = await updateOrder.mutateAsync({
        id: pedido.id,
        paid_amount: novoPagamentoTotal,
        remaining_balance: novoSaldoRestante,
        status: novoSaldoRestante <= 0 ? 'paid' : 'partial_payment',
      });

      const payment = await addPayment.mutateAsync({
        order_id: pedido.id,
        amount: valorPagamento,
        payment_option: opcaoPagamento,
      });

      await createSystemLog(addSystemLog, {
        userId: user.id,
        username: user.email,
        action: 'create',
        tableName: 'payments',
        recordId: payment.id,
        description: `Pagamento de R$ ${valorPagamento.toFixed(2)} registrado para o pedido ${pedido.order_number} usando ${opcaoPagamento}`,
        level: 'info'
      });

      toast({
        title: "Pagamento processado com sucesso!",
        description: `Novo saldo restante: R$ ${novoSaldoRestante.toFixed(2)}`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
          <Button onClick={handlePagamento}>Confirmar Pagamento</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessarPagamentoModal;