import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdatePayment } from '../integrations/supabase';
import { toast } from "@/components/ui/use-toast";

const EditarPagamentoModal = ({ payment, onClose, paymentOptions }) => {
  const [editedPayment, setEditedPayment] = useState({
    amount: payment.amount,
    payment_option: payment.payment_option,
    description: payment.description || '',
  });

  const updatePayment = useUpdatePayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        ...editedPayment,
      });
      toast({
        title: "Pagamento atualizado com sucesso!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              type="number"
              step="0.01"
              value={editedPayment.amount}
              onChange={(e) => setEditedPayment({ ...editedPayment, amount: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Opção de Pagamento</label>
            <Select
              value={editedPayment.payment_option}
              onValueChange={(value) => setEditedPayment({ ...editedPayment, payment_option: value })}
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
              value={editedPayment.description}
              onChange={(e) => setEditedPayment({ ...editedPayment, description: e.target.value })}
            />
          </div>
          <Button type="submit">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarPagamentoModal;