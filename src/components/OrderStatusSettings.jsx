import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useOrderStatusSettings, useUpdateOrderStatusSettings } from '../integrations/supabase/hooks/order_status_settings';

const OrderStatusSettings = ({ isOpen, onClose }) => {
  const [fullPaymentStatus, setFullPaymentStatus] = useState('in_production');
  const [partialPaymentStatus, setPartialPaymentStatus] = useState('partial_payment');
  const [zeroPaymentStatus, setZeroPaymentStatus] = useState('pending');
  const [allowZeroPayment, setAllowZeroPayment] = useState(false);

  const { data: settings } = useOrderStatusSettings();
  const updateSettings = useUpdateOrderStatusSettings();

  useEffect(() => {
    if (settings) {
      setFullPaymentStatus(settings.full_payment_status);
      setPartialPaymentStatus(settings.partial_payment_status);
      setZeroPaymentStatus(settings.zero_payment_status);
      setAllowZeroPayment(settings.allow_zero_payment);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      fullPaymentStatus,
      partialPaymentStatus,
      zeroPaymentStatus,
      allowZeroPayment
    }, {
      onSuccess: () => {
        toast.success("Configurações salvas com sucesso!");
        onClose();
      },
      onError: (error) => {
        toast.error("Erro ao salvar configurações: " + error.message);
      }
    });
  };

  const statusOptions = [
    { value: 'in_production', label: 'Em Produção' },
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'partial_payment', label: 'Pagamento Parcial' },
    { value: 'awaiting_approval', label: 'Aguardando Aprovação' },
    { value: 'ready_for_pickup', label: 'Pronto para Retirada' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Status dos Pedidos</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Status para Pagamento Total</Label>
            <Select value={fullPaymentStatus} onValueChange={setFullPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status para Pagamento Parcial</Label>
            <Select value={partialPaymentStatus} onValueChange={setPartialPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status para Pagamento Zero</Label>
            <Select value={zeroPaymentStatus} onValueChange={setZeroPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow-zero-payment"
              checked={allowZeroPayment}
              onCheckedChange={setAllowZeroPayment}
            />
            <Label htmlFor="allow-zero-payment">Permitir pagamento com valor zero</Label>
          </div>

          <Button onClick={handleSave} className="w-full">Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusSettings;