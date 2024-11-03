import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPayment } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const AdicionarPagamentoModal = ({ isOpen, onClose, paymentOptions }) => {
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_option: '',
    description: '',
    order_id: '',
  });

  const addPayment = useAddPayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPayment.mutateAsync({
        ...newPayment,
        amount: parseFloat(newPayment.amount),
      });
      toast({
        title: "Pagamento adicionado com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao adicionar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Número do Pedido</label>
            <Input
              value={newPayment.order_id}
              onChange={(e) => setNewPayment({ ...newPayment, order_id: e.target.value })}
              placeholder="ID do pedido"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              type="number"
              step="0.01"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Opção de Pagamento</label>
            <Select
              value={newPayment.payment_option}
              onValueChange={(value) => setNewPayment({ ...newPayment, payment_option: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a opção de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={newPayment.description}
              onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
              placeholder="Descrição do pagamento"
            />
          </div>
          <Button type="submit">Adicionar Pagamento</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarPagamentoModal;